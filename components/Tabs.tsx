import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createBottomTabNavigator();
export const Tabs = withLayoutContext(Navigator);