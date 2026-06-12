
////////////////////////////////////////

// ///pinecone setups
const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const Chatgpt_proj_index = pc.index('chatgpt-proj');

async function createMemory({vectors,metadata ,messageId}){
  await Chatgpt_proj_index.upsert([{
    id:messageId,
    values: vectors,
    metadata
  }])
}

async function queryMemory({queryVector, limit = 5, metadata}){
  const data = await Chatgpt_proj_index.query({
    vector: queryVector,
    topK : limit, // topK = kitne output data points chahiye
    filter: metadata ? metadata : undefined,
    includeMetadata: true
  })

  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory
}

// / pinecone setups
