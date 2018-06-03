import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { connectRoutes } from 'redux-first-router'
import createHistory from 'history/createBrowserHistory'
import routesMap from './routesMap'
import thunk from 'redux-thunk'
import * as reducers from './reducers/index'
import saga from '../sagas'
import axios from 'axios'
import axiosMiddleware from 'redux-axios-middleware'
import actionTypes from './actionTypes'


const { TRACKS_CREATE_SUCCESS } = actionTypes


const history = createHistory()

const sagaMiddleware = createSagaMiddleware()

const { reducer, middleware, enhancer } = connectRoutes(history, routesMap)

const rootReducer = combineReducers({
	...reducers,
	location: reducer
})

const client = axios.create({
	baseURL: process.env.REACT_APP_API_BASE_URL,
	responseType: 'json'
})

const axiosMiddlewareConfig = {
	interceptors: {
		request: [{
			success: function ({ getState, dispatch, getSourceAction }, req) {
				return req
			},
			error: function ({ getState, dispatch, getSourceAction }, error) {
			}
		}],
		response: [{
			success: function ({ getState, dispatch, getSourceAction }, response) {
				const actionType = getSourceAction(response.config).type
				if (actionType === TRACKS_CREATE_SUCCESS) {
					console.log(actionType)
				}
				return response
			},
			error: function ({ getState, dispatch, getSourceAction }, error) {
			}
		}]
	}
}

const middlewares = applyMiddleware(
	middleware,
	thunk,
	axiosMiddleware(client, axiosMiddlewareConfig),
	sagaMiddleware,
)

const preloadedState = {
	track: {
		tracks: [],
		isFetching: false
	},
	player: {
		audioPlayer: null,
		isPlaying: false,
		markerPosition: 0,
		howl: () => {
			console.log('howl')
		}
	},
	recording: {
		completed: false,
	}
}

const store = createStore(
	rootReducer,
	preloadedState,
	compose(enhancer, middlewares)
)

sagaMiddleware.run(saga)

export default store