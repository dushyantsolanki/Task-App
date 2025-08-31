import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { loadQAStuffChain } from 'langchain/chains';

export async function runGroqSearchQA(scrapedText, userQuery) {
  try {
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      // model: 'deepseek-r1-distill-llama-70b',
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([scrapedText.slice(0, 15000)]);

    const prompt = new PromptTemplate({
      template: `${` **Instruction**: 
  Answer the question using ONLY the provided context. Structure your response in markdown with:
  - Clear headings (##, ###)
  - Bullet points for lists
  - Bold/italic for emphasis
  - Code blocks for technical terms
  - Escape special characters

  **Required Format**:
  \`\`\`markdown
  ## [Main Heading]
  [Brief description in 1-2 sentences.]

  ### [Subheading 1]
  - Point 1
  - Point 2

  ### [Subheading 2]
  \`\`\`code
  [Optional code snippet if relevant]
  \`\`\`

  **Context**:
  {context}

  **Question**:
  {question}

  **Rules**:
  - Never invent information outside the context.
  - Prioritize clarity and readability.
  - Use line breaks between sections.`}`,
      inputVariables: ['context', 'question'],
    });

    const chain = loadQAStuffChain(model, { prompt });

    console.log('chain initialized successfully');

    const response = await chain.invoke({
      input_documents: docs,
      question: userQuery,
    });

    return response.text || response.output_text;
  } catch (error) {
    console.error('Error in runGroqSearchQA:', error);
    throw error;
  }
}
