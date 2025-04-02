import { Alert, Flex } from "@chakra-ui/react"

export function AlertNotes({
  notes,
  status = "info"
}: {
  notes: React.ReactNode[]
  status?: React.ComponentProps<typeof Alert.Root>["status"]
}) {
  return (
    <Alert.Root status={status}>
      <Alert.Indicator />
      <Alert.Content gap={2}>
        {notes &&
          notes.map((note, idx) => (
            <Alert.Description key={idx}>
              <Flex gap={1}>
                {`>`} {note}
              </Flex>
            </Alert.Description>
          ))}
      </Alert.Content>
    </Alert.Root>
  )
}
