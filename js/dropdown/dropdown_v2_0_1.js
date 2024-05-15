class Dropdown {
    constructor() {

        this.notesTab = new NotesTab();

        this.aiTab = new AITab();

        this.dataTab = new DataTab();

        document.querySelectorAll('input[type=range]').forEach(this.updateSlider.bind(this));

        this.editTab = new EditTab();


        //disable ctl +/- zoom on browser
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '=')) {
                event.preventDefault();
            }
        });

        document.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        }, {
            passive: false
        });

        document.body.style.transform = "scale(1)";
        document.body.style.transformOrigin = "0 0";


        // Get the menu button and dropdown content elements
        this.menuButton = document.querySelector(".menu-button");
        this.dropdownContent = document.querySelector(".dropdown-content");
        this.nodePanel = document.querySelector(".node-panel");


        // Get the first tabcontent element
        const firstTab = document.querySelector(".tabcontent");

        this.dropdownContent.addEventListener("paste", function (e) {
        });
        this.dropdownContent.addEventListener("wheel", function (e) {
            cancel(e);
        });
        this.dropdownContent.addEventListener("dblclick", function (e) {
            cancel(e);
        });

        // Add an event listener to the menu button
        this.menuButton.addEventListener("click", this.onMenuButtonClick.bind(this));

        this.dropdownContent.addEventListener("mousedown", (e) => {
            cancel(e);
        });

        // Get all the menu items.
        const menuItems = document.querySelectorAll(".menu-item");

        // Add a click event listener to each menu item
        menuItems.forEach(function (item) {
            item.addEventListener("click", function () {
                // Remove the "selected" class from all the menu items
                // menuItems.forEach(function(item) {
                //   item.classList.remove("selected");
                // });

                // Add the "selected" class to the clicked menu item
                item.classList.add("selected");
            });
        });

        this.toolsTab = new ToolsTab();
        this.nodesTab = new NodesTab();

        const buttonLabels = document.querySelectorAll(".button-label");
        buttonLabels.forEach(function(label) {
            let panelContainerID = label.getAttribute("for");
            let panelContainer = document.querySelector("#" + panelContainerID + " > div.toggle-panel-inner-container");
            let togglePanel = document.querySelector("#" + panelContainerID + " > .toggle-panel");
            togglePanel.onclick = label.onclick = function() {
                const openDropdowns = panelContainer.querySelectorAll('.options-replacer.show');
                openDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                    const dropdownContainer = dropdown.closest('.select-replacer');
                    if (dropdownContainer) {
                        dropdownContainer.classList.add('closed');
                    }
                });
                if (panelContainer.classList.contains('hidden')) {
                    panelContainer.classList.add('panel-open');
                    // Expand the panel
                    panelContainer.classList.remove('hidden');
                    panelContainer.style.display = ''; // Make it visible for height calculation

                    // Directly set the height to start the transition
                    panelContainer.style.height = panelContainer.scrollHeight + 'px';
                } else {
                    panelContainer.classList.remove('panel-open');

                    // Collapse the panel
                    panelContainer.style.height = '0px'; // Trigger the collapse animation

                    // Wait for the transition to finish before adding 'hidden'
                    function onTransitionEnd() {
                        panelContainer.classList.add('hidden');
                        panelContainer.style.display = 'none'; // Fully hide after animation
                        panelContainer.removeEventListener('transitionend', onTransitionEnd);
                    }

                    panelContainer.addEventListener('transitionend', onTransitionEnd, { once: true });
                }
            }
        })

    }

    setSliderBackground(slider) {
        const min = slider.min ? parseFloat(slider.min) : 0;
        const max = slider.max ? parseFloat(slider.max) : 100;
        const value = slider.value ? parseFloat(slider.value) : 0;
        const percentage = (value - min) / (max - min) * 100;
        slider.style.background = `linear-gradient(to right, #006BB6 0%, #006BB6 ${percentage}%, #18181c ${percentage}%, #18181c 100%)`;
    }

    updateSlider(slider) {
        // Set the background color split initially
        this.setSliderBackground(slider);

        // Update background color split and save slider values when the slider value changes
        slider.addEventListener('input', function () {
            this.setSliderBackground(slider);
        }.bind(this));
    }

    openTab(tabId, element) {
        var i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("activeTab"); // We use classList.remove to remove the class
        }

        document.getElementById(tabId).style.display = "block";
        element.classList.add("activeTab"); // We use classList.add to add the class

        myCodeMirror.refresh();
    }

    // Previously anonymous inline
    onMenuButtonClick(event) {

        // Prevent the click event from propagating
        event.stopPropagation();

        // Toggle the "open" class on the menu button and dropdown content
        this.menuButton.classList.toggle("open");
        this.dropdownContent.classList.toggle("open");
        this.nodePanel.classList.toggle("open");

        // If the dropdown is opened, manually set the first tab to active and display its content
        if (this.dropdownContent.classList.contains("open")) {
            var tablinks = document.getElementsByClassName("tablink");
            var tabcontent = document.getElementsByClassName("tabcontent");

            // Remove active class from all tablinks and hide all tabcontent
            for (var i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
                tabcontent[i].style.display = "none";
            }

            // Open the first tab
            this.openTab('tab1', tablinks[0]);
            // this.openTab('tab8', tablinks[7]);

            // If there's any selected text, deselect it
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
        }
        myCodeMirror.refresh();
    }


}

