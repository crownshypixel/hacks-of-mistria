import { Stack, Text } from "@chakra-ui/react"
import { Image } from "@chakra-ui/react"
import { useState, Fragment, useRef, useEffect } from "react"

import adelineWriteFrame0 from "src/assets/adeline-write/frame-0.png"
import adelineWriteFrame1 from "src/assets/adeline-write/frame-1.png"
import adelineWriteFrame2 from "src/assets/adeline-write/frame-2.png"
import adelineWriteFrame3 from "src/assets/adeline-write/frame-3.png"

const adelineFrames = [adelineWriteFrame0, adelineWriteFrame1, adelineWriteFrame2, adelineWriteFrame3]

export function LoadingMessage({ frames = adelineFrames, message }: { frames?: string[]; message: string }) {
  return (
    <Stack gap={-20} py="20" h="250px" alignItems="center" flexDir="column">
      <Text textStyle="xl" display="flex">
        {message}
        <span style={{ width: "20px" }}>
          <LoadingDots />
        </span>
      </Text>
      <LoadingSprite ml="-10px" framesArray={frames} mt={-5} />
    </Stack>
  )
}

type Callback = () => void

type LoadingDotsProps = {
  numOfDots?: number
  delay?: number
}

export function LoadingDots({ numOfDots = 3, delay = 480 }: LoadingDotsProps) {
  const [dots, setDots] = useState(1)
  useInterval(() => {
    setDots((currDots) => (++currDots === numOfDots + 1 ? (currDots = 1) : currDots))
  }, delay)

  return (
    <Fragment>
      {Array.from({ length: dots }, () => ".").map((dot, idx) => (
        <Fragment key={idx}>{dot}</Fragment>
      ))}
    </Fragment>
  )
}

export function useInterval(callback: Callback, delay: number) {
  const savedCallback = useRef<Callback>(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current?.()
    const id = setInterval(tick, delay)

    return () => clearInterval(id)
  }, [delay])
}

export const LoadingSprite = ({
  framesArray,
  width = 150,
  height = 150,
  fps = 24,
  ...restProps
}: {
  framesArray: string[]
  width?: number
  height?: number
  fps?: number
} & React.ComponentProps<typeof Image>) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % framesArray.length)
    }, fps * 10)

    return () => clearInterval(interval)
  }, [])

  return <Image src={framesArray[frame]} width={width} height={height} {...restProps} />
}
