import { User } from '../auth/user.model';
import * as actions from './auth.actions';

export interface State {
  user: User;
  authError: string;
  loading: boolean;
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false,
};

export function authReducer(
  state: State = initialState,
  action: actions.AuthActions
): State {
  switch (action.type) {
    case actions.AUTHENTICATE_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        authError: null,
        loading: false,
      };
    case actions.LOGOUT:
      return {
        ...state,
        user: null,
      };
    case actions.LOGIN_START:
    case actions.SIGNUP_START:
      return {
        ...state,
        authError: null,
        loading: true,
      };
    case actions.AUTHENTICATE_FAIL:
      return {
        ...state,
        user: null,
        authError: action.payload,
        loading: false,
      };
    case actions.CLEAR_ERROR:
      return {
        ...state,
        authError: null,
      };
    default:
      return state;
  }
}
