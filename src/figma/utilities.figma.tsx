import figma from '@figma/code-connect'

const FILE = 'https://www.figma.com/design/qMaXgnOynqam9u6xIKg17p'

figma.connect(`${FILE}?node-id=1204-10`, {
  example: () => <div className="label-xs">THIS WEEK · 7 DAYS</div>,
})

figma.connect(`${FILE}?node-id=1204-13`, {
  example: () => <span className="bubble-positive">+40</span>,
})

figma.connect(`${FILE}?node-id=1204-15`, {
  example: () => <span className="bubble-negative">-20</span>,
})

figma.connect(`${FILE}?node-id=1204-21`, {
  example: () => <div className="panel p-5">{/* content */}</div>,
})

figma.connect(`${FILE}?node-id=1204-25`, {
  example: () => <div className="panel-dark p-5">{/* content */}</div>,
})

figma.connect(`${FILE}?node-id=1204-29`, {
  example: () => <div className="brass-border p-4">{/* content */}</div>,
})

figma.connect(`${FILE}?node-id=1204-32`, {
  example: () => <div className="ruled-line" />,
})

figma.connect(`${FILE}?node-id=1204-35`, {
  example: () => (
    <div className="art-deco-divider">
      <span className="label-xs">· · ·</span>
    </div>
  ),
})
