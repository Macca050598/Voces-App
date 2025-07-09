import { Image, StyleSheet } from "react-native";

interface BackgroundLogoProps {
  opacity?: number;
  position?: 'left' | 'center' | 'right';
}

const BackgroundLogo = ({ opacity = 0.05, position = 'left' }: BackgroundLogoProps) => {
  const getPositionStyle = () => {
    switch (position) {
      case 'center':
        return { alignSelf: 'center' as const };
      case 'right':
        return { alignSelf: 'flex-end' as const };
      default:
        return { alignSelf: 'flex-start' as const };
    }
  };

  return (
    <Image
      source={require("@/assets/images/Logo/V bg.png")}
      style={[
        styles.backgroundLogo,
        { opacity },
        getPositionStyle()
      ]}
      resizeMode="contain"
    />
  );
};

export default BackgroundLogo;

const styles = StyleSheet.create({
  backgroundLogo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
}); 