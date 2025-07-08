import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { withLayoutContext } from 'expo-router';

const BottomTabNavigator = createBottomTabNavigator().Navigator;

const Tabs = withLayoutContext(BottomTabNavigator);

export default Tabs;