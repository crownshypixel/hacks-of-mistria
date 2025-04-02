import { Alert } from "@chakra-ui/react"

export function AlertNotes({
  notes,
  status = "info",
  children
}: {
  notes?: string[]
  status: React.ComponentProps<typeof Alert.Root>["status"]
  children?: React.ReactNode
}) {
  return (
    <Alert.Root status={status}>
      <Alert.Indicator />
      <Alert.Content gap={2}>
        {!children && notes ? (
          notes.map((note, idx) => <Alert.Description key={idx}>{`> ${note}`}</Alert.Description>)
        ) : (
          <>{children}</>
        )}
      </Alert.Content>
    </Alert.Root>
  )
}
