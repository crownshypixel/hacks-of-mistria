import { Alert } from "@chakra-ui/react"

export function AlertNotes({ notes }: { notes: string[] }) {
  return (
    <Alert.Root status="info">
      <Alert.Indicator />
      <Alert.Content gap={2}>
        {notes.map((note, idx) => (
          <Alert.Description key={idx}>{`> ${note}`}</Alert.Description>
        ))}
      </Alert.Content>
    </Alert.Root>
  )
}
