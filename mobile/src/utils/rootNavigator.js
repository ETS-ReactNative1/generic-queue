import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef()

export function resetStack() {
  if (navigationRef.isReady()) {
    while (navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
    navigationRef.dispatch(StackActions.replace('Auth'));
  }
}