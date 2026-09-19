import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export function createDynamoStore(tableName, client) {
  if (!tableName) return undefined;
  client ??= DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const get = async (pk, sk) => {
    const result = await client.send(new GetCommand({ TableName: tableName, Key: { PK: pk, SK: sk } }));
    return result.Item;
  };
  const queryIndex = async (index, pk) => {
    const items = [];
    let start;
    do {
      const result = await client.send(new QueryCommand({
        TableName: tableName, IndexName: index, ExclusiveStartKey: start,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': index === 'GSI1' ? 'GSI1PK' : index === 'GSI2' ? 'GSI2PK' : 'GSI3PK' },
        ExpressionAttributeValues: { ':pk': pk },
      }));
      items.push(...(result.Items || []));
      start = result.LastEvaluatedKey;
    } while (start);
    return items;
  };
  return {
    async getAsset(id) { return get(`ASSET#${id}`, 'METADATA'); },
    async getByTag(tag) {
      const items = await queryIndex('GSI1', `TAG#${tag.toLowerCase()}`);
      return items[0];
    },
    async listByUser(userId) { return queryIndex('GSI2', `USER#${userId}`); },
    async listByDepartment(department) { return queryIndex('GSI3', `DEPT#${department}`); },
    async scanAssets() {
      const items = [];
      let start;
      do {
        const result = await client.send(new ScanCommand({
          TableName: tableName, ExclusiveStartKey: start,
          FilterExpression: 'SK = :meta',
          ExpressionAttributeValues: { ':meta': 'METADATA' },
        }));
        items.push(...(result.Items || []));
        start = result.LastEvaluatedKey;
      } while (start);
      return items;
    },
    async putAsset(item) {
      await client.send(new PutCommand({ TableName: tableName, Item: item }));
    },
    async getProfile(sub) { return get(`USER#${sub}`, 'PROFILE'); },
    async putProfile(item) {
      await client.send(new PutCommand({ TableName: tableName, Item: item }));
    },
  };
}
