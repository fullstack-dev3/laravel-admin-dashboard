<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Organization;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class UserController extends Controller
{
	public function login(Request $request)
	{
		$validator = Validator::make(
			$request->all(),
			[
				'email' => 'required|string|email|max:255',
				'password' => 'required|string|min:6',
			]
		);

		if ($validator->fails()) {
			return response()->json(
				[
					'status' => 'fail',
					'data' => $validator->errors(),
				],
				422
			);
		}

		$credentials = $request->only('email', 'password');
		try {
			if (!$token = JWTAuth::attempt($credentials)) {
				return response()->json(
					[
							'status' => 'error',
							'message'=> 'Invalid credentials.'
					],
					406
				);
			}
		} catch (JWTException $e) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Invalid credentials.'
				],
				406
			);
		}

		$user = User::where('email', $request->email)->first();
		$member = Member::where('id', $user->member_id)->get();

		if (sizeof($member) > 0) {
			if ($member[0]->active) {
				$org = Organization::find($member[0]->organization_id);

				return response()->json([
					'status' => 'success',
					'data' => [
						'token' => $token,
						'user' => [
							'member_info' => $member[0],
							'org_name' => $org->name_o,
							'logo' => $org->logo,
							'level' => $org->level,
							'country' => $org->country,
							'is_nf' => $user->is_nf,
							'is_super' => 0,
							'is_club_member' => $org->is_club
						]
					]
				], 200);
			} else {
				return response()->json(
					[
						'status' => 'error',
						'message' => 'User is not activated.'
					],
					406
				);
			}
		} else {
				return response()->json([
						'status' => 'success',
						'data' => [
								'token' => $token,
								'user' => [
										'member_info' => $user,
										'is_super' => 1,
										'is_club_member' => 0
								]
						]
				], 200);
		}
	}

	public function profile()
	{
		$user = JWTAuth::parseToken()->authenticate();

		$member = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
								->leftJoin('roles', 'roles.id', '=', 'members.role_id')
								->where('members.id', $user->member_id)
								->select('members.*', 'organizations.parent_id', 'organizations.name_o', 'roles.name AS role')
								->get();

		return response()->json($member[0]);
	}

	public function setting()
	{
		$user = JWTAuth::parseToken()->authenticate();

		$setting = Member::leftJoin('settings', 'settings.organization_id', '=', 'members.organization_id')
								->where('members.id', $user->member_id)
								->select('settings.*')
								->get();

		return response()->json($setting[0]);
	}

	public function reset(Request $request, $token)
	{
		$data = $request->all();

		$user = JWTAuth::parseToken()->authenticate();

		if (!(Hash::check($data['current'], $user->password))) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Your current password does not matches with the password you provided. Please try again.'
				],
				406
			);
		}

		if(strcmp($data['current'], $data['password']) == 0){
			return response()->json(
				[
					'status' => 'error',
					'message' => 'New Password cannot be same as your current password. Please choose a different password.'
				],
				406
			);
		}

		$validatedData = $request->validate([
			'current' => 'required',
			'password' => 'required|string|min:6|confirmed',
		]);

		$user->password = Hash::make($data['password']);
		$user->save();

		return response()->json(
			[
				'status' => 'success',
				'message' => 'Password changed successfully !'
			],
			200
		);
	}
}