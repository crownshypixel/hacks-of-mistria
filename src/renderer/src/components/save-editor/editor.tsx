import { Button, Center, Stack } from "@chakra-ui/react"
import { LoadingMessage } from "src/components/custom/loading"
import { useGameSaveInfo } from "src/queries"
import { CharacterEditing } from "src/components/save-editor/character"
import { BirthdayEditing } from "src/components/save-editor/birthday"
import { CalendarEditing } from "src/components/save-editor/calendar"
import { StatsEditing } from "src/components/save-editor/stats"
import { InventoryEditing } from "src/components/save-editor/inventory"
import { AppPage, useActiveSaveId, useAppPage } from "src/store"
import { EditorStoreProvider } from "src/components/save-editor/context"

export function SaveEditor() {
  const { setAppPage } = useAppPage()
  const { activeSaveId: saveId, setActiveSaveId } = useActiveSaveId()
  const { isPending, data } = useGameSaveInfo(saveId)

  if (!saveId) {
    return <Center py={18}>This should never happen. You entered the save editor page without a save id</Center>
  }

  if (isPending) {
    return <LoadingMessage message="Loading your save information" />
  }

  const goBackHandler = () => {
    setAppPage(AppPage.GameSaves)
    setActiveSaveId(null)
  }

  return (
    <Stack gap={4} m={4}>
      <Button w="min-content" bg="white.600" h="min-content" onClick={goBackHandler}>
        Go Back
      </Button>

      <EditorStoreProvider initialData={data!}>
        <Stack pt={4} gap={8}>
          <CharacterEditing />
          <BirthdayEditing />
          <CalendarEditing />
          <StatsEditing />
          <InventoryEditing />
        </Stack>
      </EditorStoreProvider>
    </Stack>
  )
}
