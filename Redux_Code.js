import {types} from './actions';

const initialState = {
    events: [],
    didFetch: false,
    loading: false,
    posting:false,
    eventToEdit:{}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.REQUEST_FETCH_EVENTS:
            return {
                ...state,
                loading:true,
            };
        case types.DELIVER_FETCH_EVENTS:
            return {
                ...state,
                loading:false,
                events: action.payload,
                didFetch:true
            };
        case types.REQUEST_DELETE_EVENT:
            return{
                ...state,
                loading:true
            };
        case types.DELIVER_DELETE_EVENT:
            return{
                ...state,
                loading:false,
                events:action.payload
            };
        case types.REQUEST_POST_EVENT:
            return{
                ...state,
                posting:true,
            };
        case types.DELIVER_POST_EVENTS:
            return{
                ...state,
                events: action.payload,
                posting:false
            };
        case types.REQUEST_UPDATE_EVENT:
            return{
                ...state,
                posting:true,
            };
        case types.DELIVER_UPDATE_EVENT:
            return{
                ...state,
                events: action.payload,
                posting:false
            };
        case types.SELECT_EVENT_TO_EDIT:
            return{
                ...state,
                eventToEdit:action.payload
            };
        default:
            return {
                ...state,
            }
    }
}