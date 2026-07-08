import figma from '@figma/code-connect'
import BubbleGauge from '../components/dashboard/BubbleGauge'
import WeekView from '../components/dashboard/WeekView'

const FILE = 'https://www.figma.com/design/qMaXgnOynqam9u6xIKg17p'

figma.connect(BubbleGauge, `${FILE}?node-id=1206-22`, {
  example: () => <BubbleGauge />,
})

// All WeekView day cell variants point to the same component
figma.connect(WeekView, `${FILE}?node-id=1206-30`, {
  example: () => <WeekView />,
})
figma.connect(WeekView, `${FILE}?node-id=1206-33`, {
  example: () => <WeekView />,
})
figma.connect(WeekView, `${FILE}?node-id=1206-36`, {
  example: () => <WeekView />,
})
figma.connect(WeekView, `${FILE}?node-id=1206-39`, {
  example: () => <WeekView />,
})
figma.connect(WeekView, `${FILE}?node-id=1206-42`, {
  example: () => <WeekView />,
})
