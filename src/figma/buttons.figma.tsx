import figma from '@figma/code-connect'

const FILE = 'https://www.figma.com/design/qMaXgnOynqam9u6xIKg17p'

// btn-brass — primary action button
figma.connect(`${FILE}?node-id=1204-3`, {
  example: () => (
    <button className="btn-brass">LOG ACTIVITY</button>
  ),
})

// btn-ghost — secondary / cancel button
figma.connect(`${FILE}?node-id=1204-5`, {
  example: () => (
    <button className="btn-ghost">CANCEL</button>
  ),
})

// Button/Danger — destructive confirm (inline styles, used in anchor dialogs)
figma.connect(`${FILE}?node-id=1204-7`, {
  example: () => (
    <button style={{
      background: 'rgba(60,20,20,1)',
      border: '1px solid rgba(200,80,80,0.4)',
      color: 'rgba(230,100,100,1)',
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      fontSize: '0.7rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      padding: '11px 28px',
      borderRadius: '1px',
      cursor: 'pointer',
    }}>
      CONFIRM
    </button>
  ),
})
