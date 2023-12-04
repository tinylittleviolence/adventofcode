const { open } = require('node:fs/promises');



readRawCalibrationsFromFile('../files/1.txt')
  .then((raw) => {
    return extractCalibrationValues(raw, true)
  })
  .then((nums) => {
    return produceCalibration(nums)
  })
  .then((result) => {
    console.log(`Answer to challenge 1: ${result}`);
    return result;
  })
;

async function readRawCalibrationsFromFile (file) {

    const stream = await open(file);

    let rawCalibrations = [];

    for await (const l of stream.readLines()) {

        rawCalibrations.push(l);

    }

    return rawCalibrations;

}

async function extractCalibrationValues (calibrationArray, unfuck) {

    let extractedValues = [];

    for (let v of calibrationArray) {

        let numbers;
      
        if (unfuck) {
          //if we're unfuckening the phonetic numbers, go do that
          numbers = await unfuckPhoneticNumbers(v).then((res) => {
            return res;
          });
        }
        else {
          //otherwise filter to only the digits in the string
          numbers = v.split("").filter(x => !isNaN(x));
        }

        //trim to only the first and last and convert to an integer

        let relevantNumbers = parseInt(numbers.at(0).concat(numbers.at(-1)));
        extractedValues.push(relevantNumbers);

    }

    return extractedValues;

}   

async function produceCalibration (numberArray) {

    let calibration = numberArray.reduce((x, y) => x + y, 0)

    return calibration;

}

async function unfuckPhoneticNumbers (calibrationString) {

  const unfuckConfig = [
    { from: 'one', to: '1' },
    { from: 'two', to: '2' },
    { from: 'three', to: '3' },
    { from: 'four', to: '4' },
    { from: 'five', to: '5' },
    { from: 'six', to: '6' },
    { from: 'seven', to: '7' },
    { from: 'eight', to: '8' },
    { from: 'nine', to: '9' }

  ];

  let nums = [];

  for (let i = 0; i < calibrationString.length; i++) {

    const currentChar = calibrationString.at(i);

    console.log('Checking character ' + (i + 1) + ' of ' + calibrationString.length + ': ' + currentChar);

    if (!isNaN(currentChar)) {

      nums.push(currentChar);
      console.log(`Found a digit: ${currentChar}`);

    }

    else {

      for (config of unfuckConfig) {

        let checkValue = calibrationString.substring(i, i + config.from.length);

        console.log(`comparing ${checkValue} to ${config.from} starting at position ${i} with length ${config.from.length}`);

        if (checkValue == config.from) {

          nums.push(config.to);
          console.log(`Found a phonetic match: ${checkValue} === ${config.from}!`);
          break;

        }
      }
    }

  }

  return nums;

}
