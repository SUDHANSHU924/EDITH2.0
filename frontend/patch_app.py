import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update root container
content = content.replace(
    'className="relative w-full h-screen overflow-hidden"',
    'style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#050505", display: "flex", flexDirection: "column" }}'
)
# Remove the old style to avoid conflict since we added it to the parent string. 
# Wait, the old string had:
#       style={{ background: '#050505' }}
# Let's replace the whole div tag.

old_div = """    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#050505' }}
    >"""

new_div = """    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#050505', display: 'flex', flexDirection: 'column' }}>"""
content = content.replace(old_div, new_div)

# 2. Add flex wrapper around three panels
# Find starting sequence: Left Sidebar
old_left_sidebar = """      {/* Left Sidebar — The ORBIT (offset by HUD bar) */}
      <div className="fixed left-0 top-8 bottom-0 z-50">"""
new_left_sidebar = """      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Sidebar — The ORBIT */}
        <div style={{ flexShrink: 0, height: '100%', overflow: 'hidden', zIndex: 10, borderRight: '1px solid rgba(0,240,255,0.08)' }}>"""
content = content.replace(old_left_sidebar, new_left_sidebar)


# 3. Middle panel
old_right_sidebar = """      {/* Right Sidebar — The PERIPHERY (offset by HUD bar) */}
      <div className="fixed right-0 top-8 bottom-0 z-40">"""
# Wait, the DOM order in App.tsx right now is Left -> Right -> Center.
# BUT flexbox requires Left -> Center -> Right to show up in that order without order: XX.
# I need to change DOM order or use order.
