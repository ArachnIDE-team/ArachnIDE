class EditTab {

    constructor() {
        this.debouncedSaveInputValue = debounce(function (input) {
            this.saveInputValue(input);
            //console.log(`saved`);
        }.bind(this), 300);

        document.querySelectorAll('#tab2 input[type="range"], .color-picker-container input[type="color"]').forEach(function (input) {
            input.addEventListener('input', function () {
                this.debouncedSaveInputValue(input);
            }.bind(this));
        }.bind(this));

        document.addEventListener('DOMContentLoaded', this.restoreInputValues.bind(this));

        let innerOpacitySlider = document.getElementById('inner_opacity');
        innerOpacitySlider.addEventListener('input', function () {
            settings.innerOpacity = innerOpacitySlider.value / 100;
        });
        let outerOpacitySlider = document.getElementById('outer_opacity');
        outerOpacitySlider.addEventListener('input', function () {
            settings.outerOpacity = outerOpacitySlider.value / 100;
        });
        // Initialize the slider with the settings.renderWidthMult value
        let renderWidthMultSlider = document.getElementById("renderWidthMultSlider");
        renderWidthMultSlider.value = settings.renderWidthMult;
        renderWidthMultSlider.dispatchEvent(new Event('input'));
        // Initialize the slider with the settings.maxLines value
        let maxLinesSlider = document.getElementById("maxLinesSlider");
        maxLinesSlider.value = settings.maxLines;
        maxLinesSlider.dispatchEvent(new Event('input'));
        // Initialize the slider with the settings.regenDebtAdjustmentFactor value
        let regenDebtSlider = document.getElementById("regenDebtSlider");
        regenDebtSlider.value = settings.regenDebtAdjustmentFactor;
        regenDebtSlider.dispatchEvent(new Event('input'));
        document.getElementById("length").addEventListener("input", this.onLengthValueInput.bind(this));
        document.getElementById("renderWidthMultSlider").addEventListener("input", this.onRenderWidthMultSliderInput.bind(this));
        this.setRenderLength(this.getLength());
        document.getElementById("maxLinesSlider").addEventListener("input", this.onMaxLinesSliderInput.bind(this));
        this.setRenderQuality(this.getQuality());
        document.getElementById("quality").addEventListener("input", this.onQualityValueInput.bind(this));
        document.getElementById("exponent").addEventListener("input", this.onExponentValueInput.bind(this));
        // Adding event listeners to the sliders
        document.getElementById('flashlightStrength').addEventListener('input', this.updateFlashlightStrength);
        document.getElementById('flashlightRadius').addEventListener('input', this.updateFlashlightRadius);
        // Setting the initial values of the sliders
        document.getElementById('flashlightStrength').value = flashlight_fraction;
        document.getElementById('flashlightRadius').value = flashlight_stdev;
        // Triggering the input event to refresh the sliders and update the display
        this.triggerInputEvent('flashlightStrength');
        this.triggerInputEvent('flashlightRadius');


    }
    // TO-DO: Get rid of localStorage
    saveInputValue(input) {
        const savedValues = localStorage.getItem('inputValues');
        const inputValues = savedValues ? JSON.parse(savedValues) : {};

        inputValues[input.id] = input.value;
        localStorage.setItem('inputValues', JSON.stringify(inputValues));
    }

    // TO-DO: Get rid of localStorage
    restoreInputValues() {
        const savedValues = localStorage.getItem('inputValues');
        if (savedValues) {
            const inputValues = JSON.parse(savedValues);
            document.querySelectorAll('#tab2 input[type="range"], .color-picker-container input[type="color"]').forEach(input => {
                if (input.id in inputValues) {
                    input.value = inputValues[input.id];
                    // Trigger the input event for both sliders and color pickers
                    setTimeout(() => {
                        input.dispatchEvent(new Event('input'));
                    }, 100);
                }
            });
        }
    }

    getLength() {
        let v = document.getElementById("length").value / 100;
        return 2 ** (v * 8);
    }

    getRegenDebtAdjustmentFactor() {
        let v = document.getElementById("regenDebtSlider").value;
        return v;
    }

    setRenderWidthMult(v) {
        settings.renderWidthMult = v;
    }

    getRenderWidthMult() {
        const sliderValue = parseFloat(document.getElementById("renderWidthMultSlider").value);

        let transformedValue;
        if (sliderValue <= 50) {
            // More granularity in lower range
            transformedValue = sliderValue / 5;
        } else {
            // Less granularity in higher range
            transformedValue = 10 + ((sliderValue - 50) * 2);
        }

        return transformedValue;
    }

    setRenderLength(l) {
        let f = settings.renderStepSize * settings.renderSteps / l;
        //settings.renderStepSize /= f;
        //settings.renderWidthMult *= f;
        settings.renderSteps /= f;
    }

    getMaxLines() {
        let v = parseInt(document.getElementById("maxLinesSlider").value);
        return v;
    }

    setRenderQuality(n) {
        let q = 1 / n;
        let f = settings.renderStepSize / q;
        settings.renderStepSize = q;
        settings.renderWidthMult *= f;
        settings.renderSteps *= f;
    }

    getQuality() {
        let v = document.getElementById("quality").value / 100;
        return 2 ** (v * 4);
    }

    getMaxDistForExponent(exponent) {
        const exponentToMaxDist = {
            1: 4,
            2: 4,
            3: 1.5,
            4: 1.25,
            5: 1,
            6: 1,
            7: 1,
            8: 1
        };

        return exponentToMaxDist[exponent] || 4; // default to 4 if no mapping found
    }

    // Function to update the flashlight strength and its display
    updateFlashlightStrength() {
        var strengthSlider = document.getElementById('flashlightStrength');
        flashlight_fraction = parseFloat(strengthSlider.value);
        document.getElementById('flashlightStrength_value').textContent = flashlight_fraction.toFixed(3);
    }

    // Function to update the flashlight radius and its display
    updateFlashlightRadius() {
        var radiusSlider = document.getElementById('flashlightRadius');
        flashlight_stdev = parseFloat(radiusSlider.value);
        document.getElementById('flashlightRadius_value').textContent = flashlight_stdev.toFixed(3);
    }

    // Function to trigger an input event on a slider
    triggerInputEvent(sliderId) {
        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        var slider = document.getElementById(sliderId);
        slider.dispatchEvent(event);
    }

    // Previously anonymous inline
    onLengthValueInput(e) {
        let v = this.getLength();
        this.setRenderLength(v);
        document.getElementById("length_value").textContent = (Math.round(v * 100) / 100);
    }

    // Previously anonymous inline
    onRenderWidthMultSliderInput(e) {
        let adjustedValue = this.getRenderWidthMult();
        this.setRenderWidthMult(adjustedValue);
        document.getElementById("renderWidthMultValue").textContent = adjustedValue.toFixed(2);
    }

    // Previously anonymous inline
    onMaxLinesSliderInput(e) {
        let v = this.getMaxLines();
        settings.maxLines = v;
        document.getElementById("maxLinesValue").textContent = + v;
    }

    // Previously anonymous inline
    onQualityValueInput(e) {
        let v = this.getQuality();
        this.setRenderQuality(v);
        document.getElementById("quality_value").textContent = "Quality:" + (Math.round(v * 100) / 100);
    }

    // Previously anonymous inline
    onExponentValueInput(e) {
        let v = e.target.value * 1; // Convert to number
        MandelbrotBG.mand_step = (z, c) => {
            return z.ipow(v).cadd(c);
        };
        document.getElementById("exponent_value").textContent = v;

        // Update maxDist based on exponent
        settings.maxDist = this.getMaxDistForExponent(v);
    }

}