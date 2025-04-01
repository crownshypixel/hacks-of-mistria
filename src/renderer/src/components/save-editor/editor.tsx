import { Box, Button, Center, Checkbox, Dialog, HStack, Portal, Spinner, Stack, Text } from "@chakra-ui/react"
import { LoadingMessage } from "src/components/custom/loading"
import { useSave, useSaves } from "src/queries"
import { CharacterEditing } from "src/components/save-editor/character"
import { BirthdayEditing } from "src/components/save-editor/birthday"
import { CalendarEditing } from "src/components/save-editor/calendar"
import { StatsEditing } from "src/components/save-editor/stats"
import { InventoryEditing } from "src/components/save-editor/inventory"
import { AppPage, useActiveSaveId, useActiveSavePath, useAppPage } from "src/store"
import { EditorStoreProvider, useEditorStore } from "src/components/save-editor/context"
import { useApplySaveChanges } from "src/mutations"
import { useState } from "react"
import { AlertNotes } from "src/components/custom/alert-notes"
import { useQueryClient } from "@tanstack/react-query"

type CheckedDetails = Parameters<NonNullable<React.ComponentProps<typeof Checkbox.Root>["onCheckedChange"]>>[0]

export function SaveEditor() {
  const { activeSaveId } = useActiveSaveId()
  const { activeSavePath } = useActiveSavePath()
  const { isPending, data } = useSave(activeSaveId || activeSavePath)

  if (!activeSaveId && !activeSavePath) {
    return <Center py={18}>This should never happen. You entered the save editor page without a save id nor a save path</Center>
  }

  if (isPending) {
    return <LoadingMessage message="Loading your save data" />
  }

  if (!isPending && !data) {
    return <Center py={18}>This should never happen. useSave query resolved but didn't return any data</Center>
  }

  return (
    <EditorStoreProvider initialData={data!}>
      <Stack gap={4} m={4} pos="relative">
        <EditorLayout>
          <Stack pt={4} gap={8}>
            <CharacterEditing />
            <BirthdayEditing />
            <CalendarEditing />
            <StatsEditing />
            <InventoryEditing />
          </Stack>
        </EditorLayout>
      </Stack>
    </EditorStoreProvider>
  )
}

function EditorLayout({ children }: { children: React.ReactNode }) {
  const { setAppPage } = useAppPage()
  const { activeSavePath, setActiveSavePath } = useActiveSavePath()
  const { activeSaveId, setActiveSaveId } = useActiveSaveId()
  const [shouldBringOnTop, setShouldBringOnTop] = useState(!activeSavePath)
  const resetEdits = useEditorStore((s) => s.resetEdits)
  const saveId = useEditorStore((s) => s.edits.saveId)
  const edits = useEditorStore((s) => s.edits)
  const { mutate, isPending, isError } = useApplySaveChanges(saveId)
  const queryClient = useQueryClient()

  const goBackHandler = () => {
    if (activeSavePath) {
      setAppPage(AppPage.Menu)
      setActiveSavePath(null)
    } else {
      setAppPage(AppPage.GameSaves)
      setActiveSaveId(null)
    }
  }

  const saveChangesHandler = () => {
    mutate(
      { edits, shouldBringOnTop },
      {
        onSuccess: () => {
          queryClient.resetQueries({ queryKey: ["default-saves"], exact: true })
        }
      }
    )
  }

  const refreshHandler = () => {
    const saveKey = activeSaveId || activeSavePath
    queryClient.resetQueries({ queryKey: ["editing-save", saveKey], exact: true })
  }

  const bringOnTopCheckHandler = (e: CheckedDetails) => {
    setShouldBringOnTop(!!e.checked)
  }

  if (isError) {
    return <Center my={8}>An error has occured while applying the changes.</Center>
  }

  const alertNotes = [
    "Calendar edits don't have any impact on quests / cutscenes",
    "Renown edits will skip any rewards from leveling up",
    'By default, after clicking "Save Changes" it will bring your save to the top of your saves list in-game to make it easier for you to find it. If you don\'t like this, you can uncheck the "Bring the save to the top" button above',
    "If you want to discard your changes, click the 'Refresh' button above"
  ]

  return (
    <>
      <HStack>
        <Button disabled={isPending} w="min-content" h="min-content" bg="white" onClick={goBackHandler}>
          Go Back
        </Button>
        <Button disabled={isPending} w="min-content" h="min-content" bg="cornflowerblue" onClick={refreshHandler}>
          Refresh
        </Button>
        <HStack>
          <Button disabled={isPending} bg="green.600" w="min-content" h="min-content" onClick={saveChangesHandler}>
            Save Changes
          </Button>
        </HStack>
      </HStack>
      {!activeSavePath && (
        <Checkbox.Root
          disabled={isPending}
          w="fit"
          colorPalette="orange"
          size="md"
          checked={shouldBringOnTop}
          onCheckedChange={bringOnTopCheckHandler}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>Bring the save to the top</Checkbox.Label>
        </Checkbox.Root>
      )}
      <AlertNotes notes={alertNotes} />
      {isPending ? <LoadingMessage message="saving your changes" /> : children}
      {!isPending && (
        <Text textStyle="sm" pos="absolute" bottom="2" right="0" opacity={0.8}>
          {saveId}
        </Text>
      )}
    </>
  )
}
