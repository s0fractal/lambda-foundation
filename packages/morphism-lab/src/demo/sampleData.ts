/**
 * Sample data for live pipeline execution
 */

export interface Event {
  id: string;
  text: string;
  emotion?: 'joy' | 'sadness' | 'neutral';
  timestamp: number;
  value?: number;
}

export const sampleEvents: Event[] = [
  {
    id: '1',
    text: 'I love this new feature! It\'s amazing! 🎉',
    emotion: 'joy',
    timestamp: Date.now() - 5000,
    value: 10
  },
  {
    id: '2',
    text: 'This is okay, nothing special',
    emotion: 'neutral',
    timestamp: Date.now() - 4000,
    value: 5
  },
  {
    id: '3',
    text: 'I\'m really disappointed with this',
    emotion: 'sadness',
    timestamp: Date.now() - 3000,
    value: 2
  },
  {
    id: '4',
    text: 'Absolutely fantastic work! Keep it up! 💪',
    emotion: 'joy',
    timestamp: Date.now() - 2000,
    value: 15
  },
  {
    id: '5',
    text: 'Not sure how I feel about this',
    emotion: 'neutral',
    timestamp: Date.now() - 1000,
    value: 6
  },
  {
    id: '6',
    text: 'This brings me so much happiness! 😊',
    emotion: 'joy',
    timestamp: Date.now(),
    value: 12
  },
  {
    id: '7',
    text: 'I\'m sad to see this go',
    emotion: 'sadness',
    timestamp: Date.now() + 1000,
    value: 3
  },
  {
    id: '8',
    text: 'Just another regular day',
    emotion: 'neutral',
    timestamp: Date.now() + 2000,
    value: 7
  }
];

export const keywords = [
  'feature', 'amazing', 'fantastic', 'work', 'happy', 'happiness',
  'disappointed', 'sad', 'okay', 'neutral', 'regular'
];
