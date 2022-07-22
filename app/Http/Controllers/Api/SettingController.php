<?php
namespace App\Http\Controllers\Api;

use App\Setting;

use Illuminate\Http\Request;

class SettingController extends Controller
{
  public function allsetting()
	{
		$setting = Setting::leftJoin('organizations', 'settings.organization_id', '=', 'organizations.id')
								->select('settings.*', 'organizations.name_o')
								->get();

		return response()->json($setting);
  }
  
	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, $id)
	{
		$data = $request->all();

		$setting = Setting::where('organization_id', $id)->get();

		if (sizeof($setting) > 0) {
			if (isset($data['percent'])) {
				Setting::where('organization_id', $id)->update(array(
					'price' => $data['price'],
					'percent' => $data['percent']
				));
			} else {
				Setting::where('organization_id', $id)->update(array(
					'price' => $data['price']
				));
			}
		} else {
			if (isset($data['percent'])) {
				Setting::create(array(
					'organization_id' => $id,
					'price' => $data['price'],
					'percent' => $data['percent']
				));
			} else {
				Setting::create(array(
					'organization_id' => $id,
					'price' => $data['price'],
					'percent' => 0.0
				));
			}
		}

		$settings = Setting::leftJoin('organizations', 'settings.organization_id', '=', 'organizations.id')
									->select('settings.*', 'organizations.name_o')
									->get();

		return response()->json($settings);
	}
}