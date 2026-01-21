import { createFileRoute } from '@tanstack/react-router'
import { Card, Typography } from '@mui/material'
import './index.css'
import useGetUsage from '../queries/getUsage';



interface WindowSegment {
  appExe: string,
  duration: number
}

const MOCK_DATA: WindowSegment[] = [
  {
    appExe: "chrome.exe",
    duration: 5400000
  },
  {
    appExe: "code.exe",
    duration: 3600000
  },
  {
    appExe: "spotify.exe",
    duration: 1800000
  }
]

export const Route = createFileRoute('/')({
  component: Index,
})


function Index() {
  const { data: greeting } = useGetUsage();

  return (
    <div>    
      <h1>Screen Time</h1>
      <h3>{greeting}</h3>
      {MOCK_DATA.map((segment, index) => (
        <Card key={index} sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 2,
          marginBottom: 2
        }}>
          <Typography>{segment.appExe}</Typography>
          <Typography>Duration: {Math.floor(segment.duration / 60000)} minutes</Typography>
        </Card>
      ))}
    </div>
  )
}
