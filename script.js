const villager = document.getElementById('villager');

// जब भी माउस स्क्रीन पर हिलेगा, यह कोड चलेगा
document.addEventListener('mousemove', (event) => {
    // माउस की पोजीशन
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // विलेजर की पोजीशन
    const villagerRect = villager.getBoundingClientRect();
    const villagerX = villagerRect.left + villagerRect.width / 2;
    const villagerY = villagerRect.top + villagerRect.height / 2;

    // बिना AI के गणित से दूरी (Distance) निकालना
    const distance = Math.sqrt(Math.pow(mouseX - villagerX, 2) + Math.pow(mouseY - villagerY, 2));

    // IF (माउस विलेजर के बहुत पास आ गया है) -> तो भागो!
    if (distance < 100) {
        // स्क्रीन पर कोई भी रैंडम नई जगह ढूंढो
        const newX = Math.random() * (window.innerWidth - 50);
        const newY = Math.random() * (window.innerHeight - 50);

        // विलेजर को नई जगह पर भेज दो
        villager.style.left = `${newX}px`;
        villager.style.top = `${newY}px`;
    }
});
