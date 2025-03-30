import { Card, Flex, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { SEASONS, translateCalendar, translateClock, translatePlaytime } from "src/time-utils"
import { translateRenown } from "src/renown-utils"

import springIcon from "src/assets/seasons/spring.png"
import summerIcon from "src/assets/seasons/summer.png"
import fallIcon from "src/assets/seasons/fall.png"
import winterIcon from "src/assets/seasons/winter.png"
import renownIcon from "src/assets/renown.png"
import tessaraeIcon from "src/assets/tessarae.webp"
import essenceIcon from "src/assets/essence.png"
import farmIcon from "src/assets/farm.png"
import calendarIcon from "src/assets/calendar.png"
import playerIcon from "src/assets/name.png"
import autoSaveIcon from "src/assets/save/auto.png"
import manualSaveIcon from "src/assets/save/manual.png"

const seasonIcons: {
  [K in (typeof SEASONS)[number]]: string
} = {
  spring: springIcon,
  summer: summerIcon,
  fall: fallIcon,
  winter: winterIcon
}

type SaveInfo = Awaited<ReturnType<typeof window.api.invoke.getAllSavesInfo>>[string]

type SaveCardProps = {
  save: SaveInfo
  onClick: (saveId: string) => void
} & Omit<React.ComponentProps<typeof Card.Root>, "onClick">

export function SaveCard({ save, onClick, ...props }: SaveCardProps) {
  const isAutosave = save.saveId.includes("autosave")

  const clockTime = translateClock(save.clock)
  const formattedClock = `${String(clockTime.hour)}:${String(clockTime.minutes).padStart(2, "0")} ${clockTime.period}`

  const { day, seasonIdx, year } = translateCalendar(save.calendar)
  const season = SEASONS[seasonIdx]

  const renownInfo = translateRenown(save.renown)

  const styles = {
    background: {
      spring: "green.900/70",
      summer: "yellow.950/70",
      fall: "rose.950/70",
      winter: "blue.950/70"
    },
    foreground: {
      spring: "green.50",
      summer: "yellow.50",
      fall: "rose.50",
      winter: "blue.50"
    },
    border: {
      spring: "green.600",
      summer: "yellow.600",
      fall: "rose.600",
      winter: "blue.600"
    }
  }

  const isSpring = season === "spring"
  const isSummer = season === "summer"
  const isFall = season === "fall"
  const isWinter = season === "winter"

  const _onClickHandler = () => {
    onClick(save.saveId)
  }

  return (
    <Card.Root
      as="button"
      w="full"
      p={4}
      bg={styles.background[season]}
      color={styles.foreground[season]}
      filter={isWinter || isFall ? "brightness(0.95)" : "brightness(1)"}
      borderColor={styles.border[season]}
      borderWidth={3}
      cursor="pointer"
      onClick={_onClickHandler}
      {...props}
    >
      <Card.Body p={1} w="full">
        <HStack>
          <Flex justifyContent="space-between" w="full">
            <Flex gap={3} justifyContent="space-between" w="full" alignItems="flex-start">
              <HStack>
                <Stack>
                  <HStack>
                    <Image src={playerIcon} draggable={false} w="24px" h="24px" />
                    <Text>{save.playerName}</Text>
                  </HStack>
                  <HStack>
                    <Image src={farmIcon} draggable={false} w="24px" h="24px" />
                    <Text>{save.farmName}</Text>
                  </HStack>
                  <HStack>
                    <Image src={tessaraeIcon} draggable={false} w="24px" h="24px" />
                    <Text>{save.gold}</Text>
                  </HStack>
                  <HStack>
                    <Image src={essenceIcon} draggable={false} w="24px" h="24px" />
                    <Text>{save.essence}</Text>
                  </HStack>
                  <HStack>
                    <Text ml="5px">Play Time: {translatePlaytime(save.playtime)}</Text>
                  </HStack>
                </Stack>
              </HStack>
              <Stack right="0" top="0" align="end">
                <HStack>
                  <Text textStyle="xl" fontWeight="bold">
                    {formattedClock}
                  </Text>
                </HStack>
                <HStack>
                  <Text textTransform="capitalize">
                    {season} {day}
                  </Text>
                  <Image src={seasonIcons[SEASONS[seasonIdx]]} draggable={false} w="24px" h="24px" />
                </HStack>
                <HStack>
                  <Text>Year {year}</Text>
                  <Image src={calendarIcon} draggable={false} w="24px" h="24px" />
                </HStack>
                <HStack>
                  <Text textTransform="capitalize">
                    {renownInfo === null
                      ? save.renown
                      : `Lvl. ${(renownInfo as NonNullable<ReturnType<typeof translateRenown>>).level}`}
                  </Text>
                  <Image src={renownIcon} draggable={false} pos="relative" top="-3px" w="24px" h="24px" />
                </HStack>
                <HStack>
                  <Text opacity="0.5">{save.saveId}</Text>
                  <Image src={isAutosave ? autoSaveIcon : manualSaveIcon} draggable={false} w="24px" h="24px" />
                </HStack>
              </Stack>
            </Flex>
          </Flex>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
