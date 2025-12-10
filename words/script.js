window.addEventListener('load', function() {
    const inputForm = document.getElementById('inputForm');
    const outputForm = document.getElementById('outputForm');
    const dropZone = document.getElementById('dropZone');
    const inputText = document.getElementById('inputText');
    const clicksDisplay = document.getElementById('clicksDisplay');
    
    const clickedValues = [];
    let initialData = [];
    
    const elementPositions = new Map();
    
    function generateRandomHexColor() {  
        const colorValue = Math.floor(Math.random() * 16777215).toString(16);  
        return `#${colorValue.padStart(6, '0')}`;  
    }
    
    function refreshClickDisplay() {
        if (clickedValues.length === 0) {
            clicksDisplay.textContent = 'Кликов пока нет';
            return;
        }
        
        const displayContent = clickedValues.join(' ');
        clicksDisplay.textContent = displayContent;
    }
    
    function saveElementPosition(element, x, y) {
        const containerRect = dropZone.getBoundingClientRect();

        const relativeX = x / containerRect.width;
        const relativeY = y / containerRect.height;
        elementPositions.set(element.dataset.uniqueId, { relativeX, relativeY });
    }
    
    function adjustDroppedItemsPosition() {
        const droppedItems = dropZone.querySelectorAll('.dropped-item');
        const containerRect = dropZone.getBoundingClientRect();
        
        droppedItems.forEach(item => {
            const uniqueId = item.dataset.uniqueId;
            if (elementPositions.has(uniqueId)) {

                const pos = elementPositions.get(uniqueId);
                const newX = pos.relativeX * containerRect.width;
                const newY = pos.relativeY * containerRect.height;
                
                const maxX = containerRect.width - item.offsetWidth;
                const maxY = containerRect.height - item.offsetHeight;
                
                const finalX = Math.max(0, Math.min(newX, maxX));
                const finalY = Math.max(0, Math.min(newY, maxY));
                
                item.style.left = finalX + 'px';
                item.style.top = finalY + 'px';
            }
        });
    }
    
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustDroppedItemsPosition, 100);
    }
    
    window.addEventListener('resize', handleResize);
    
    inputText.value = 'лес-бочка-20-бык-крик-3-Бок';
    
    inputForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userInput = inputText.value.trim();
        
        const inputParts = userInput.split('-').map(part => part.trim()).filter(part => part !== '');
        
        const smallLetters = [];
        const capitalLetters = [];
        const numericValues = [];
        
        inputParts.forEach(part => {
            if (!isNaN(part) && part.trim() !== '') {
                numericValues.push(parseFloat(part));
            } else if (part.charAt(0) === part.charAt(0).toUpperCase() && part.charAt(0) !== part.charAt(0).toLowerCase()) {
                capitalLetters.push(part);
            } else {
                smallLetters.push(part);
            }
        });
        
        smallLetters.sort();
        capitalLetters.sort();
        numericValues.sort((x, y) => x - y);
        
        const processedData = [];
        
        smallLetters.forEach((word, idx) => {
            processedData.push({ id: `a${idx + 1}`, content: word });
        });
        
        capitalLetters.forEach((word, idx) => {
            processedData.push({ id: `b${idx + 1}`, content: word });
        });
        
        numericValues.forEach((num, idx) => {
            processedData.push({ id: `n${idx + 1}`, content: num.toString() });
        });
        
        initialData = [...processedData];
        
        renderOutput(processedData);
    });
    
    function renderOutput(data) {
        outputForm.innerHTML = '';
        dropZone.innerHTML = '';
        elementPositions.clear(); 
        
        clickedValues.length = 0;
        refreshClickDisplay();
        
        if (data.length === 0) {
            return;
        }
        
        data.forEach(item => {
            const element = createSourceItem(item);
            outputForm.appendChild(element);
        });
        
        setupDragDrop();
    }
    
    function createSourceItem(item) {
        const element = document.createElement('div');
        element.className = 'item';
        element.textContent = `${item.id} ${item.content}`;
        element.draggable = true;
        element.dataset.id = item.id;
        element.dataset.content = item.content;
        
        element.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            
            const dimensions = this.getBoundingClientRect();
            
            e.dataTransfer.setData('text/plain', JSON.stringify({
                id: this.dataset.id,
                content: this.dataset.content,
                displayText: this.textContent,
                source: 'leftPanel',
                width: dimensions.width,
                height: dimensions.height
            }));
            e.dataTransfer.effectAllowed = 'move';
        });
        
        element.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
        
        return element;
    }
    
    function createDroppedItem(data, posX, posY) {
        const element = document.createElement('div');
        element.className = 'dropped-item';
        element.textContent = data.displayText;
        
        element.dataset.id = data.id;
        element.dataset.content = data.content;
        element.dataset.uniqueId = `${data.id}_${Date.now()}`;
        
        if (data.source === 'leftPanel') {
            const randomColor = generateRandomHexColor();
            element.style.background = randomColor;
        }
        
        if (data.width && data.height) {
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
        } 
        element.style.left = posX + 'px';
        element.style.top = posY + 'px';
        
        saveElementPosition(element, posX, posY);
        
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            processElementClick(this);
        });
        
        enableDragging(element);
        
        return element;
    }
    
    function processElementClick(element) {
        const contentValue = element.dataset.content;
        clickedValues.push(contentValue);
        refreshClickDisplay();
    }
    
    function enableDragging(element) {
        element.draggable = true;
        
        element.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            
            const dimensions = this.getBoundingClientRect();
            
            e.dataTransfer.setData('text/plain', JSON.stringify({
                id: this.dataset.id,
                content: this.dataset.content,
                displayText: this.textContent,
                source: 'rightPanel',
                uniqueId: this.dataset.uniqueId,
                width: dimensions.width,
                height: dimensions.height
            }));
            e.dataTransfer.effectAllowed = 'move';
        });
        
        element.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            this.style.transform = '';
            
            const currentX = parseFloat(this.style.left);
            const currentY = parseFloat(this.style.top);
            saveElementPosition(this, currentX, currentY);
        });
    }
    
    function placeElementSorted(element, id) {
        const children = Array.from(outputForm.children);
        let position = -1;
        
        for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.id > id) {
                position = i;
                break;
            }
        }
        
        if (position === -1) {
            outputForm.appendChild(element);
        } else {
            outputForm.insertBefore(element, children[position]);
        }
    }
    
    function setupDragDrop() {
        dropZone.addEventListener('dragover', processDragOverRight);
        dropZone.addEventListener('dragenter', processDragEnterRight);
        dropZone.addEventListener('dragleave', processDragLeaveRight);
        dropZone.addEventListener('drop', processDropRight);
        
        outputForm.addEventListener('dragover', processDragOverLeft);
        outputForm.addEventListener('dragenter', processDragEnterLeft);
        outputForm.addEventListener('dragleave', processDragLeaveLeft);
        outputForm.addEventListener('drop', processDropLeft);
    }
    
    function processDragOverRight(e) {
        e.preventDefault();
        //e.dataTransfer.dropEffect = 'move';
    }
    
    function processDragEnterRight(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    }
    
    function processDragLeaveRight(e) {
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    }
    
    function processDropRight(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const transferData = e.dataTransfer.getData('text/plain');
        if (!transferData) return;
        
        const parsedData = JSON.parse(transferData);
        
        const containerRect = dropZone.getBoundingClientRect();
        const xPos = e.clientX - containerRect.left - (parsedData.width / 2);
        const yPos = e.clientY - containerRect.top - (parsedData.height / 2);
        
        if (parsedData.source === 'leftPanel') {
            const newElement = createDroppedItem(parsedData, xPos, yPos);
            dropZone.appendChild(newElement);
            
            const draggedElement = document.querySelector('.item.dragging');
            if (draggedElement) {
                draggedElement.remove();
            }
        } else if (parsedData.source === 'rightPanel') {
            const draggedElement = document.querySelector('.dropped-item.dragging');
            if (draggedElement) {
                draggedElement.style.left = xPos + 'px';
                draggedElement.style.top = yPos + 'px';
                
                saveElementPosition(draggedElement, xPos, yPos);
            }
        }
    }
    
    function processDragOverLeft(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function processDragEnterLeft(e) {
        e.preventDefault();
        outputForm.classList.add('drag-over');
    }
    
    function processDragLeaveLeft(e) {
        if (!outputForm.contains(e.relatedTarget)) {
            outputForm.classList.remove('drag-over');
        }
    }
    
    function processDropLeft(e) {
        e.preventDefault();
        outputForm.classList.remove('drag-over');
        
        const transferData = e.dataTransfer.getData('text/plain');
        if (!transferData) return;
        
        const parsedData = JSON.parse(transferData);
        
        if (parsedData.source === 'rightPanel') {
            const draggedElement = document.querySelector('.dropped-item.dragging');
            if (draggedElement) {
                elementPositions.delete(draggedElement.dataset.uniqueId);
                draggedElement.remove();
            }
            
            const sourceItem = createSourceItem({
                id: parsedData.id,
                content: parsedData.content
            });
            
            placeElementSorted(sourceItem, parsedData.id);
        }
    }
    
    inputForm.dispatchEvent(new Event('submit'));
});