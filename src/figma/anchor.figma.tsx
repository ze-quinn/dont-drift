import figma from '@figma/code-connect'
import AnchorPanel from '../components/dashboard/AnchorPanel'
import ActivityLog from '../components/activities/ActivityLog'
import HabitTracker from '../components/habits/HabitTracker'

const FILE = 'https://www.figma.com/design/qMaXgnOynqam9u6xIKg17p'

// All anchor panel states are rendered by AnchorPanel based on store.anchorState
figma.connect(AnchorPanel, `${FILE}?node-id=1206-47`, {
  example: () => <AnchorPanel />,
})
