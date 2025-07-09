import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { toast } from "sonner-native";
import * as DropdownMenu from "zeego/dropdown-menu";
type MoreButtonProps = {

    pageName: string;
  
};
const MoreButton = ({pageName}: MoreButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);


const copyToClipboard = async() => {
  const path = `voces://(authenticated)/(tabs)/${pageName.toLowerCase()}`;
  await Clipboard.setStringAsync(path);
  toast.success("Link copied to clipboard");
}
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
      <TouchableOpacity activeOpacity={0.6}>
      <Ionicons name="ellipsis-horizontal-outline" size={39} color={Colors.primary} />
      </TouchableOpacity>
      </DropdownMenu.Trigger>


      <DropdownMenu.Content>
        <DropdownMenu.Item key="link" onSelect={copyToClipboard}>
        <DropdownMenu.ItemTitle>Copy Link</DropdownMenu.ItemTitle>
        <DropdownMenu.ItemIcon
          ios={{name: "link", pointSize: 22}}>
        </DropdownMenu.ItemIcon>
        </DropdownMenu.Item>


      <DropdownMenu.Group>
      <DropdownMenu.Item key="select">
        <DropdownMenu.ItemTitle>Select Tasks</DropdownMenu.ItemTitle>
        <DropdownMenu.ItemIcon
          ios={{name: "square.stack", pointSize: 22}}>
        </DropdownMenu.ItemIcon>
        </DropdownMenu.Item>

        <DropdownMenu.Item key="view">
        <DropdownMenu.ItemTitle>View</DropdownMenu.ItemTitle>
        <DropdownMenu.ItemIcon
          ios={{name: "slider.horizontal.3", pointSize: 22}}>
        </DropdownMenu.ItemIcon>
        </DropdownMenu.Item>

        <DropdownMenu.Item key="activity">
        <DropdownMenu.ItemTitle>Copy Link</DropdownMenu.ItemTitle>
        <DropdownMenu.ItemIcon
          ios={{name: "chart.xyaxis.line", pointSize: 22}}>
        </DropdownMenu.ItemIcon>
        </DropdownMenu.Item>
      </DropdownMenu.Group>








      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default MoreButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});