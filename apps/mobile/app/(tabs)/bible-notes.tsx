import { View, Text, StyleSheet } from 'react-native'

export default function BibleNotesScreen() {
  return (
    <View style={styles.container}>
      <Text>Bible Notes</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
