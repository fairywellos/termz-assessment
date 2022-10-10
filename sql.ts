// CREATE TABLE `items` (
//   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
//   `storyId` int(10) unsigned NOT NULL,
//   `title` text,
//   `createdAt` datetime default now()
// );
// 
// CREATE TABLE `stories` (
//   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
//   `channelId` int(10) not null
// );

interface StoryItem {
    id: number;
    title: string;
    storyId: number;
    createdAt: Date;
  }
  interface Story {
    id: number
    channelId: number;
  }
  interface GetStoryResultDto {
    story: Story;
    items: StoryItem[];
    itemsCount: number;
  }
  type GetStoriesResultDto = GetStoryResultDto[]
  
  interface GetStoriesDto {
    channelId: number;
    itemsLimitPerStory: number;
    itemsOrder: 'asc'|'desc';
  }
  
  const dbCall = async <T>(sql: string): Promise<T[]> => {
    // never mind, just stub
    return [];
  }
  
  const getStories = async (dto: GetStoriesDto): Promise<GetStoriesResultDto> => {
    // some dbCall examples
    const stories = await dbCall<Story>(`select stories.* from stories where stories.channelId = ${dto.channelId}`);
    const items = await dbCall<StoryItem>(`select items.* from items where items.storyId = ${stories[0].id} order by createdAt ${dto.itemsOrder} limit ${dto.itemsLimitPerStory}`);
  
   
  
    return stories.map(story => {
        const targetedItems = items.filter(item => item.storyId === story.id)
        return ({
          story,
          items: targetedItems,
          itemsCount: targetedItems.length
        })
      })
  }
  
  getStories({ channelId: 77, itemsLimitPerStory: 3, itemsOrder: 'desc' });
  
  // expected result from getStories
  const result: GetStoriesResultDto = [
    // story 1 contains only 2 items
    {
      story: { id: 1, channelId: 77 },
      items: [
        { id: 2, title: 'two', createdAt: new Date('2020-01-02'), storyId: 1 },
        { id: 1, title: 'one', createdAt: new Date('2020-01-01'), storyId: 1 },
      ],
      itemsCount: 2
    },
  
    // story 2 contains 4 items but returns only 3 (because itemsLimitPerStory limits results up to 3 elements)
    {
      story: { id: 2, channelId: 77 },
      items: [
        { id: 12, title: 'twelve', createdAt: new Date('2020-01-12'), storyId: 2 },
        { id: 11, title: 'eleven', createdAt: new Date('2020-01-11'), storyId: 2 },
        { id: 10, title: 'ten', createdAt: new Date('2020-01-10'), storyId: 2 },
      ],
      itemsCount: 4
    },
  
    // story 3 doesn't contain any items
    {
      story: { id: 3, channelId: 77 },
      items: [],
      itemsCount: 0
    },
  ];