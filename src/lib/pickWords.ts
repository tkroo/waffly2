// @ts-nocheck
import { wordlist_5 } from './wordlist_5.js';
import { wordlist_7 } from './wordlist_7.js';

const oneWordFromList = async (obj) => {

  const { len, startLetter, middleLetter, middleLetter2, endLetter } = obj;
  const myList = len == 7 ? wordlist_7 : wordlist_5;

  let constraints = {
    start: (word) => !startLetter || word[0] === startLetter,
    middle: (word) => !middleLetter || word[2] === middleLetter,
    end: (word) => !endLetter || word[len-1] === endLetter,
  };
  if(len ==7) {
    constraints = {
      ...constraints,
      middle2: (word) => !middleLetter2 || word[4] === middleLetter2,
    }
  }

  let choices = [];
  if (constraints.middle2) {
    choices = myList.filter(word => 
      // constraints.exclude(word) && 
      constraints.start(word) &&
      constraints.middle(word) &&
      constraints.middle2(word) &&
      constraints.end(word)
    );
  } else {
    choices = myList.filter(word =>
      constraints.start(word) &&
      constraints.middle(word) &&
      constraints.end(word)
    );
  }
  return choices.length ? choices[Math.floor(Math.random() * choices.length)] : undefined;
};

export const pickSixWords = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 10)); // Add a short delay
  const words = new Set();
  const maxAttempts = 20000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // top
      const word0 = await oneWordFromList({len:5});
      if (!word0) continue;

      // right
      const word1 = await oneWordFromList({len:5, startLetter: word0[4] });
      if (!word1) continue;

      // bottom
      const word2 = await oneWordFromList({len:5, endLetter: word1[4] });
      if (!word2) continue;

      // left 
      const word3 = await oneWordFromList({len:5, startLetter: word0[0], endLetter: word2[0] });
      if (!word3) continue; 

      // vertical
      const word4 = await oneWordFromList({len:5, startLetter: word0[2], endLetter: word2[2] });
      if (!word4) continue;

      // horizontals
      const word5 = await oneWordFromList({len:5, startLetter: word3[2], middleLetter: word4[2], endLetter: word1[2] });
      if (!word5) continue;

      // Add words to the set and check if all 6 are unique
      words.add(word0).add(word1).add(word2).add(word3).add(word4).add(word5);
      if (words.size === 6) {
        return [...words];
      }
      words.clear(); // Clear set if not all words are unique
    } catch (e) {
      console.log('error: ', e);
    }
  }
  return [];
}

export const pickEightWords = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 10)); // Add a short delay
  const words = new Set();
  const maxAttempts = 20000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // top
      const word0 = await oneWordFromList({len:7});
      // const word0 = 'apricot';
      if (!word0) continue;

      // right
      const word1 = await oneWordFromList({len:7, startLetter: word0[6] });
      if (!word1) continue;

      // bottom
      const word2 = await oneWordFromList({len:7, endLetter: word1[6] });
      if (!word2) continue;

      // left
      const word3 = await oneWordFromList({len:7, startLetter: word0[0], endLetter: word2[0] });
      if (!word3) continue;

      // verticals
      const word4 = await oneWordFromList({len:7, startLetter: word0[2], endLetter: word2[2] });
      if (!word4) continue;
      const word5 = await oneWordFromList({len:7, startLetter: word0[4], endLetter: word2[4] });
      if (!word5) continue;

      // horizontals
      const word6 = await oneWordFromList({len:7, startLetter: word3[2], middleLetter: word4[2], middleLetter2: word5[2], endLetter: word1[2] });
      if (!word6) continue;
      const word7 = await oneWordFromList({len:7, startLetter: word3[4], middleLetter: word4[4], middleLetter2: word5[4], endLetter: word1[4] });
      if (!word7) continue;

      // Add words to the set and check if all 8 are unique
      words.add(word0).add(word1).add(word2).add(word3).add(word4).add(word5).add(word6).add(word7);
      if (words.size === 8) {
        return [...words];
      }
      words.clear(); // Clear set if not all words are unique
    } catch (e) {
      console.log('error: ', e);
    }
  }

  console.log(`FAILED TO CHOOSE EIGHT WORDS after ${maxAttempts} attempts.`);
  return [];
  
};
