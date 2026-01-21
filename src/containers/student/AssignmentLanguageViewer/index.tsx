import React, { useCallback, useState } from 'react';

import {
  Book,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Languages,
  List,
  Sparkles,
} from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';
import Tabs from 'components/navigation/Tabs';

import AIChatBox from 'containers/common/AIChatBox';
import AIChatBoxProvider from 'containers/common/AIChatBox/AIChatBoxContext';
import ResizableSidebar from 'containers/common/ResizableSidebar';
import AssignmentLanguageViewerVocabItem from 'containers/student/AssignmentLanguageViewer/AssignmentLanguageViewerVocabItem';

interface VocabItem {
  id: string;
  word: string;
  type: 'vocabulary' | 'phrase';
}

export const AssignmentLanguageViewer = () => {
  const [samplesGenerated, setSamplesGenerated] = useState(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [vocabGenerated, setVocabGenerated] = useState(false);
  const [isGeneratingVocab, setIsGeneratingVocab] = useState(false);
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);

  const sampleTexts = [
    {
      title: 'Sample 1: Introduction Techniques',
      content: `Climate change represents one of the most pressing challenges facing our planet today. This opening sentence employs several sophisticated techniques worth noting.

Key Language Features:
• "represents" - formal verb choice instead of "is"
• "pressing challenges" - strong collocation showing urgency
• "facing our planet" - metaphorical language creating vivid imagery

The phrase "one of the most pressing challenges" is a common academic pattern for establishing significance. Notice how it combines:
- Superlative structure ("most pressing")
- Plural noun ("challenges")  
- Present participle ("facing")

Try using similar patterns:
• "constitutes a significant milestone"
• "emerges as a critical factor"
• "stands as a fundamental principle"`,
      vocabHighlights: [
        'represents',
        'pressing challenges',
        'facing our planet',
        'employs',
        'sophisticated techniques',
      ],
    },
    {
      title: 'Sample 2: Developing Arguments',
      content: `Rising temperatures have led to significant alterations in habitat conditions. Many species are being forced to migrate to new regions in search of suitable living conditions.

Key Language Features:
• "have led to" - present perfect showing cause and effect
• "significant alterations" - formal phrase emphasizing change
• "are being forced to" - passive voice showing external pressure
• "in search of" - prepositional phrase showing purpose

The cause-effect relationship is clearly marked by "have led to". This is stronger than simple "cause" or "make". Other academic alternatives include:
• "have resulted in"
• "have contributed to"
• "have given rise to"

Notice the use of "suitable" rather than "good" - this is more precise and academic. Similar upgrades include:
• appropriate, adequate, optimal, favorable`,
      vocabHighlights: [
        'have led to',
        'significant alterations',
        'are being forced to',
        'in search of',
        'suitable',
      ],
    },
    {
      title: 'Sample 3: Concluding with Impact',
      content: `The interconnected nature of Earth's ecosystems means that changes in one region can have cascading effects across the globe. This complexity underscores the urgent need for comprehensive climate action.

Key Language Features:
• "interconnected nature" - abstract noun phrase
• "cascading effects" - powerful metaphor
• "underscores" - formal verb meaning "emphasizes"
• "urgent need for" - common pattern for recommendations
• "comprehensive" - sophisticated adjective

The phrase "underscores the need for" is a classic academic construction for making recommendations. Variations include:
• "highlights the importance of"
• "emphasizes the necessity of"
• "demonstrates the requirement for"

Notice how "comprehensive" adds precision. Similar academic adjectives:
• thorough, extensive, systematic, holistic, integrated`,
      vocabHighlights: [
        'interconnected nature',
        'cascading effects',
        'underscores',
        'urgent need for',
        'comprehensive',
      ],
    },
  ];

  const generatedVocab: VocabItem[] = [
    { id: '1', word: 'represents', type: 'vocabulary' },
    { id: '2', word: 'pressing challenges', type: 'phrase' },
    { id: '3', word: 'significant', type: 'vocabulary' },
    { id: '4', word: 'alterations', type: 'vocabulary' },
    { id: '5', word: 'have led to', type: 'phrase' },
    { id: '6', word: 'in search of', type: 'phrase' },
    { id: '7', word: 'suitable', type: 'vocabulary' },
    { id: '8', word: 'interconnected', type: 'vocabulary' },
    { id: '9', word: 'cascading effects', type: 'phrase' },
    { id: '10', word: 'underscores', type: 'vocabulary' },
    { id: '11', word: 'comprehensive', type: 'vocabulary' },
    { id: '12', word: 'urgent need for', type: 'phrase' },
  ];

  const handleGenerateSamples = () => {
    setIsGeneratingSamples(true);
    setTimeout(() => {
      setSamplesGenerated(true);
      setIsGeneratingSamples(false);
    }, 2000);
  };

  const handleGenerateVocab = () => {
    setIsGeneratingVocab(true);
    setTimeout(() => {
      setVocabList(generatedVocab);
      setVocabGenerated(true);
      setIsGeneratingVocab(false);
    }, 2000);
  };

  const handleNextSample = useCallback(() => {
    if (currentSampleIndex < sampleTexts.length - 1) {
      setCurrentSampleIndex(currentSampleIndex + 1);
    }
  }, [currentSampleIndex, sampleTexts.length]);

  const handlePreviousSample = useCallback(() => {
    if (currentSampleIndex > 0) {
      setCurrentSampleIndex(currentSampleIndex - 1);
    }
  }, [currentSampleIndex]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Language Preparation</h1>
        <p className="text-muted-foreground mb-4">
          Strengthen your language skills with sample texts and vocabulary tools
        </p>

        <AIChatBoxProvider
          firstMessage="Hi! I'm here to help you set effective writing goals. Feel free to ask me questions about setting goals, writing strategies, or how to use AI tools effectively in your essay writing process."
          toolId={-1}
        >
          <ResizableSidebar initWidth={500}>
            <div>
              <Card
                classes={{
                  title: 'flex items-center gap-2',
                  description: '-mt-2 mb-2',
                }}
                description="Analyze sample texts and build your vocabulary"
                title={
                  <>
                    <Languages className="h-5 w-5 text-primary" />
                    Language Resources
                  </>
                }
              >
                <Tabs
                  className="w-full"
                  tabs={[
                    {
                      key: 'samples',
                      title: (
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Sample Texts
                        </div>
                      ),
                      content: (
                        <>
                          {!samplesGenerated ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-lg text-muted-foreground mb-2">
                                Generate sample texts with language analysis
                              </p>
                              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                                AI will create annotated samples showing key
                                vocabulary and phrases for academic writing
                              </p>
                              <Button
                                className="gap-2"
                                disabled={isGeneratingSamples}
                                onClick={handleGenerateSamples}
                              >
                                <Sparkles className="h-4 w-4" />
                                {isGeneratingSamples
                                  ? 'Generating...'
                                  : 'Generate Sample Texts'}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <Badge variant="secondary">
                                  Sample {currentSampleIndex + 1} of{' '}
                                  {sampleTexts.length}
                                </Badge>
                                <div className="flex gap-2">
                                  <Button
                                    className="gap-1"
                                    disabled={currentSampleIndex === 0}
                                    onClick={handlePreviousSample}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                  </Button>
                                  <Button
                                    className="gap-1"
                                    disabled={
                                      currentSampleIndex ===
                                      sampleTexts.length - 1
                                    }
                                    onClick={handleNextSample}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="max-h-[500px] pr-4 overflow-auto space-y-4">
                                <h3 className="font-semibold text-lg">
                                  {sampleTexts[currentSampleIndex].title}
                                </h3>
                                <div className="prose prose-sm max-w-none whitespace-pre-line">
                                  {sampleTexts[currentSampleIndex].content}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      ),
                    },
                    {
                      key: 'vocabulary',
                      title: (
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Vocabulary
                        </div>
                      ),
                      content: (
                        <>
                          {!vocabGenerated ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <List className="h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-lg text-muted-foreground mb-2">
                                Generate vocabulary list
                              </p>
                              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                                AI will extract key vocabulary and phrases from
                                the sample texts
                              </p>
                              <Button
                                className="gap-2"
                                disabled={isGeneratingVocab}
                                onClick={handleGenerateVocab}
                              >
                                <Sparkles className="h-4 w-4" />
                                {isGeneratingVocab
                                  ? 'Generating...'
                                  : 'Generate Vocabulary List'}
                              </Button>
                            </div>
                          ) : (
                            <div className="max-h-[500px] pr-4 overflow-auto">
                              <div className="space-y-3">
                                {vocabList.map(item => (
                                  <AssignmentLanguageViewerVocabItem
                                    item={item}
                                    key={item.id}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ),
                    },
                  ]}
                />
              </Card>
            </div>

            <AIChatBox
              chatName="Language Assistant"
              description="Ask questions about vocabulary, grammar, and language patterns"
              placeholder="Hello! I'm here to help you with language preparation for your essay. I can help you understand vocabulary, provide examples, and discuss language patterns. What would you like to know?"
            />
          </ResizableSidebar>
        </AIChatBoxProvider>
      </div>
    </div>
  );
};

export default AssignmentLanguageViewer;
