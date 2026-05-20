const colors = [
    // Light Reds / Pinks
    "#ff8a80", "#ff5252", "#ff1744", "#ff80ab", "#ff4081",
    // Light Blues / Cyans
    "#82b1ff", "#448aff", "#84ffff", "#18ffff", "#00e5ff",
    "#80d8ff", "#40c4ff", "#00b0ff", "#90caf9", "#64b5f6",
    // Light Greens / Teals
    "#b9f6ca", "#69f0ae", "#00e676", "#64ffda", "#1de9b6",
    "#a5d6a7", "#81c784", "#80cbc4", "#4db6ac",
    // Light Yellows / Oranges
    "#ffff8d", "#ffff00", "#ffe57f", "#ffd740", "#ffab40",
    "#ffcc80", "#ffb74d", "#ffe082", "#ffd54f"
];

const getRandomIndex = (arraySize) => Math.floor(Math.random() * arraySize);

let usedColors = new Set();

const getRandomColor = () => {

    // Unlikely to happen, but just in case, don't enter an infinite loop
    const allColorsUsed = usedColors.size >= colors.length;
    if (allColorsUsed) return "#000";

    let colorPicked = null;

    while (!colorPicked) {
        const index = getRandomIndex(colors.length);
        const color = colors[index];

        if (!usedColors.has(color)) {
            usedColors.add(color);
            colorPicked = color;
        }
    }

    return colorPicked ?? "#000";
}

const releaseColor = color => usedColors.delete(color);

export {
    getRandomColor,
    releaseColor
}
