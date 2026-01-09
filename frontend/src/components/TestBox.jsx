// Simple test component - no hooks, no logic, just renders
export default function TestBox({ color, text }) {
  return (
    <div style={{ 
      backgroundColor: color, 
      padding: '24px', 
      marginBottom: '16px', 
      color: 'white', 
      fontWeight: 'bold', 
      fontSize: '20px', 
      border: '8px solid black' 
    }}>
      {text}
    </div>
  )
}
