import { View, Text, StyleSheet } from 'react-native'

export default function ReadingPlansScreen() {
  return (
    <View style={styles.container}>
      <Text>Reading Plans</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
