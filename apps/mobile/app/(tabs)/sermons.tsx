import { View, Text, StyleSheet } from 'react-native'

export default function SermonsScreen() {
  return (
    <View style={styles.container}>
      <Text>Sermons</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
