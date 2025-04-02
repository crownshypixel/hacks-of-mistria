import { Alert, Box, Button, Center, Code, Dialog, HStack, Image, Portal, Separator, Stack, Text } from "@chakra-ui/react"
import { Toaster, toaster } from "src/components/primitives/toaster"
import { SaveEditor } from "src/components/save-editor/editor"
import sleepingJimmyGif from "src/assets/jimmy.gif"
import { LuInfo } from "react-icons/lu"
import { GameSaves } from "src/components/game-saves"
import { AppPage, useActiveSavePath, useAppPage } from "src/store"
import { useAppVersion } from "src/queries"
import { AlertNotes } from "src/components/custom/alert-notes"

export function App() {
  const { appPage, setAppPage } = useAppPage()
  const { setActiveSavePath } = useActiveSavePath()
  const { data: versionData } = useAppVersion()

  const loadAllSavesHandler = () => setAppPage(AppPage.GameSaves)
  const loadSaveHandler = async () => {
    const path = await window.api.invoke.pickSavFile()
    if (!path) return

    setActiveSavePath(path)
    setAppPage(AppPage.SaveEditor)
  }

  const loadFarmHandler = () => {}

  const backupSavesHandler = async () => {
    const res = await window.api.invoke.backupDefaultSaves()
    if (!res) return

    toaster.create({
      title: "Backup Finished",
      description: `Copied ${res.savesCopied} saves to ${res.backupPath}`
    })
  }

  if (appPage === AppPage.GameSaves) {
    return (
      <AppLayout>
        <GameSaves />
      </AppLayout>
    )
  }

  if (appPage === AppPage.SaveEditor) {
    return (
      <AppLayout>
        <SaveEditor />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {versionData && versionData.updateExists && (
        <AlertNotes status="warning">
          There is a new version ({versionData.latest}). Go to{" "}
          <a href={`https://github.com/crownshypixel/hacks-of-mistria/releases/tag/v${versionData.latest}`} target="_blank">
            https://github.com/crownshypixel/hacks-of-mistria/releases/tag/v{versionData.latest}
          </a>
        </AlertNotes>
      )}
      <Menu>
        <Menu.Option
          showJimmy
          color="orange"
          onClick={loadAllSavesHandler}
          name="Load All Saves"
          infoDescription={
            <Text>
              Detects and loads all your saves automatically from
              <Code my="2" textStyle="md">
                C:\Users\You\AppData\Local\FieldsOfMistria\saves
              </Code>
            </Text>
          }
        />
        <Menu.Option
          color="yellow"
          name="Load Save"
          onClick={loadSaveHandler}
          infoDescription={<Text>Pick and load a save manually from your files</Text>}
        />
        <Menu.Option
          color="purple"
          name="Load Farm (soon)"
          infoDialogSize="lg"
          infoDescription={
            <Text>
              Pick and load your <Code textStyle="md">farm.json</Code>. Except if your steam games are being saved in another
              drive, the farm should be located on:
              <Code my="2" textStyle="md">
                C:\Program Files (x86)\Steam\steamapps\common\Fields of Mistria\starting_farms
              </Code>
            </Text>
          }
        />
        <Menu.Option
          color="green"
          onClick={backupSavesHandler}
          name="Backup Saves"
          infoDescription={
            <Text>
              Copies the saves from your default directory
              <Code my="2" textStyle="md">
                C:\Users\You\AppData\Local\FieldsOfMistria\saves
              </Code>
              <br />
              to one of your choosing
            </Text>
          }
        />
      </Menu>
    </AppLayout>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { appPage } = useAppPage()
  const isMenuPage = appPage === AppPage.Menu

  return (
    <>
      <Box>
        <Center py={4} pos="relative">
          <Text textStyle="2xl" userSelect="none">
            Hacks of Mistria
          </Text>
          {!isMenuPage && <SleepyJimmy pos="absolute" right="0" top="0" transform="translateX(-50%) scaleX(-1)" />}
        </Center>
        <Separator />
      </Box>
      {children}
      <Toaster />
    </>
  )
}

const Menu = function ({
  children,
  ...rest
}: {
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Center>, "children">) {
  return (
    <Center pt="80px" {...rest}>
      <Stack maxW="450px" w="full" py="10" justifyContent="start" gap={4}>
        {children}
      </Stack>
    </Center>
  )
}

Menu.Option = function Option({
  color,
  onClick,
  name,
  infoDescription,
  infoDialogSize = "md",
  showJimmy = false
}: {
  color: string
  onClick?: () => void
  name: string
  infoDescription: React.ReactNode
  infoDialogSize?: React.ComponentProps<typeof Dialog.Root>["size"]
  showJimmy?: boolean
}) {
  return (
    <HStack position="relative">
      <Button w="full" size="xl" bg={`${color}.600`} onClick={onClick}>
        {name}
      </Button>
      {showJimmy && <SleepyJimmy position="absolute" transform="scaleX(-1)" right="-4" bottom="2" />}
      <InfoDialog title={name} size={infoDialogSize}>
        {infoDescription}
      </InfoDialog>
    </HStack>
  )
}

function SleepyJimmy(props: React.ComponentProps<typeof Image>) {
  return <Image pointerEvents="none" draggable={false} userSelect="none" src={sleepingJimmyGif} w="100px" h="100px" {...props} />
}

function InfoDialog({
  title,
  children,
  size = "md"
}: {
  title: string
  children: React.ReactNode
  size?: React.ComponentProps<typeof Dialog.Root>["size"]
}) {
  return (
    <Dialog.Root size={size}>
      <Dialog.Trigger asChild>
        <Button size="xl" variant="outline" w="25px">
          <LuInfo />
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{children}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
