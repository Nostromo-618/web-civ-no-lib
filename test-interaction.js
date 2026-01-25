// Test script to interact with the game
// This will be executed in the browser console
console.log("Testing unit selection...");
// Get canvas element
const canvas = document.getElementById('game-canvas');
if (canvas) {
    // Simulate click on canvas at unit position (approximate)
    const rect = canvas.getBoundingClientRect();
    const clickX = rect.left + 800;
    const clickY = rect.top + 600;
    
    // Create and dispatch click event
    const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: clickX,
        clientY: clickY
    });
    canvas.dispatchEvent(clickEvent);
    console.log("Click event dispatched at", clickX, clickY);
} else {
    console.log("Canvas not found");
}
