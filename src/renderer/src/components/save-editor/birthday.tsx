import { useEditorStore } from "src/components/save-editor/context"
import { daysCollection, reverseCalendar, SEASON_IDX, seasonsCollection, translateCalendar } from "src/time-utils"
import { HStack, Image, Stack, Text } from "@chakra-ui/react"
import { SelectInput } from "src/components/custom/select-input"
import editIcon from "src/assets/edit.png"

export function BirthdayEditing() {
  const { birthday, setEdits } = useEditorStore((s) => ({ birthday: s.edits.birthday, setEdits: s.setEdits }))

  const handleBirthdayDayChange = (day: number) =>
    setEdits((draft) => {
      draft.birthday = reverseCalendar({ year: 1, seasonIdx: translateCalendar(birthday).seasonIdx, day: day })
    })

  const handleBirthdaySeasonChange = (seasonIdx: SEASON_IDX) =>
    setEdits((draft) => {
      draft.birthday = reverseCalendar({ year: 1, seasonIdx, day: translateCalendar(birthday).day })
    })

  return (
    <Stack gap={4}>
      <HStack>
        <Image src={editIcon} w="24px" h="24px" />
        <Text>Birthday</Text>
      </HStack>
      <HStack flexWrap="wrap">
        <SelectInput
          w="250px"
          collection={seasonsCollection}
          textLabel="Season"
          value={translateCalendar(birthday).seasonIdx}
          onValueChange={handleBirthdaySeasonChange}
        />

        <SelectInput
          w="250px"
          collection={daysCollection}
          textLabel="Day"
          value={translateCalendar(birthday).day}
          onValueChange={handleBirthdayDayChange}
        />
      </HStack>
    </Stack>
  )
}
