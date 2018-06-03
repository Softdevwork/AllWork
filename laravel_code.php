<?php

namespace App\Http\Controllers\Admin;

use App;
use Image;
use App\Entry;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class EntryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function __construct()
    {
     
        $this->middleware('auth');
        
    }

    public function index(Request $request)
    {

        
        $entries = DB::table('entries')
            ->orderBy('date', 'desc')
            ->get();

        return $entries;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Entry  $entry
     * @return \Illuminate\Http\Response
     */
    public function show(Entry $entry, $id)
    {

        $entry = Entry::find($id);
        
        if(!$entry){
            return response()->json([
                'message' => 'Record not found',
            ], 404);
        }else{
            return $entry;
        }

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Entry  $entry
     * @return \Illuminate\Http\Response
     */
    public function edit(Entry $entry, $id)
    {

        $entry = Entry::find($id);

        return view('admin.edit', compact('entry'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Entry  $entry
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Entry $entry, $id)
    {

        if(is_numeric($id)){
            
            $entry = Entry::find($id);

            if($entry){

                $this->validate($request, [
                    'lat' => 'required|numeric|between:34.70,41.75',
                    'lon' => 'required|numeric|between:19.35,29.65',
                    'location' => 'required',
                    'date' => 'required|date|before:tomorrow',
                    'animal_condition' => 'required',
                    'animal_category' => 'required',
                    // 'animal_description' => 'required',
                    // 'animal_death_cause' => 'required', // 'required_if:animal_condition,==,Νεκρό'
                    // 'photo' => 'mimes:jpg,jpeg',
                    'private' => 'required'
                ]);

                $entry->lat = $request->input('lat');
                $entry->lon = $request->input('lon');
                $entry->location = $request->input('location');
                $entry->date = Carbon::createFromFormat('d-m-Y', $request->input('date'));
                $entry->animal_condition = $request->input('animal_condition');
                $entry->animal_death_cause = $request->input('animal_death_cause');
                $entry->animal_category = $request->input('animal_category');
                $entry->animal_description = $request->input('animal_description');
                $entry->comments = $request->input('comments');
                $entry->private = $request->input('private');
                $entry->save();
                
                return back()->with('status', 'Το περιστατικό ενημερώθηκε!');
            }

        }else{
            // Ajax method
            $entry = Entry::find($request->post('id'));

            if($entry){

                if($request->post('status') == 'on'){
                    $status = 1;
                }else{
                    $status = 0;
                }
                
                $entry->status = $status;
                $entry->save();
                
                return response()->json([
                    'success' => 'Record patched!',
                    'status' => $status
                ], 200);
            }            
        }

        if(!$entry){
            return response()->json([
                'error' => 'Record not found!',
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Entry  $entry
     * @return \Illuminate\Http\Response
     */
    public function destroy(Entry $entry)
    {
        
    }
}
