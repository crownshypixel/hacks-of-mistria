import { useEditorStore } from "src/components/save-editor/context"
import { daysCollection, reverseCalendar, SEASON_IDX, seasonsCollection, translateCalendar } from "src/time-utils"
import { HStack, IconButton, Image, NumberInput, Stack, Text } from "@chakra-ui/react"
import { SelectInput } from "src/components/custom/select-input"
import editIcon from "src/assets/edit.png"
import { Field } from "src/components/primitives/field"
import { LuMinus, LuPlus } from "react-icons/lu"

export function CalendarEditing() {
  const calendar = useEditorStore((s) => s.edits.calendar)
  const setEdits = useEditorStore((s) => s.setEdits)

  const handleCalendarDayChange = (day: number) => {
    const currentCalendar = translateCalendar(calendar)
    setEdits((draft) => {
      draft.calendar = reverseCalendar({ year: currentCalendar.year, seasonIdx: currentCalendar.seasonIdx, day })
    })
  }

  const handleCalendarSeasonChange = (seasonIdx: SEASON_IDX) => {
    const currentCalendar = translateCalendar(calendar)
    setEdits((draft) => {
      draft.calendar = reverseCalendar({ year: currentCalendar.year, seasonIdx, day: currentCalendar.day })
    })
  }

  const handleCalendarYearChange = (
    yearInputDetails: Parameters<
      NonNullable<Pick<React.ComponentProps<typeof NumberInput.Root>, "onValueChange">["onValueChange"]>
    >[0]
  ) => {
    const currentCalendar = translateCalendar(calendar)
    setEdits((draft) => {
      draft.calendar = reverseCalendar({
        year: yearInputDetails.valueAsNumber,
        seasonIdx: currentCalendar.seasonIdx,
        day: currentCalendar.day
      })
    })
  }

  return (
    <Stack gap={4}>
      <HStack>
        <Image src={editIcon} w="24px" h="24px" />
        <Text>Calendar</Text>
      </HStack>
      <HStack flexWrap="wrap">
        <SelectInput
          w="250px"
          collection={daysCollection}
          textLabel="Day"
          value={translateCalendar(calendar).day}
          onValueChange={handleCalendarDayChange}
        />

        <SelectInput
          w="250px"
          collection={seasonsCollection}
          textLabel="Season"
          value={translateCalendar(calendar).seasonIdx}
          onValueChange={handleCalendarSeasonChange}
        />

        <Field w="250px" label="Year">
          <NumberInput.Root
            min={1}
            value={translateCalendar(calendar).year.toString()}
            onValueChange={handleCalendarYearChange}
            unstyled
            spinOnPress={false}
          >
            <HStack gap="2">
              <NumberInput.DecrementTrigger h="10" w="10" asChild>
                <IconButton variant="outline" size="sm">
                  <LuMinus />
                </IconButton>
              </NumberInput.DecrementTrigger>
              <NumberInput.ValueText textAlign="center" fontSize="lg" minW="3ch" />
              <NumberInput.IncrementTrigger h="10" w="10" asChild>
                <IconButton variant="outline" size="sm">
                  <LuPlus />
                </IconButton>
              </NumberInput.IncrementTrigger>
            </HStack>
          </NumberInput.Root>
        </Field>
      </HStack>
    </Stack>
  )
}
