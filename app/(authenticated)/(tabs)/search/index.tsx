import BackgroundLogo from "@/components/BackgroundLogo";
import { Colors } from "@/constants/Colors";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Search() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <BackgroundLogo opacity={1} position="left" />
      
      {/* <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={Colors.lightText}
        />
      </View> */}
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic" 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search results will go here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
});