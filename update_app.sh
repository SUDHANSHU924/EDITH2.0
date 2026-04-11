cat /workspaces/EDITH2.0/frontend/src/App.tsx | sed 's/className="relative w-full h-screen overflow-hidden"/style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#050505", display: "flex", flexDirection: "column" }}/g' > temp1.tsx
mv temp1.tsx /workspaces/EDITH2.0/frontend/src/App.tsx
