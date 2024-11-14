import Author from '../models/author'; // Adjust the import to your Author model path
import { getAuthorList } from '../pages/authors'; // Adjust the import to your function
import { Response } from 'express';
import { showAllAuthors } from '../pages/authors';

describe('getAuthorList', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch and format the authors list correctly', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('should format fullname as empty string if first name is absent', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: '',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            },
            {
                first_name: 'Rabindranath',
                family_name: 'Tagore',
                date_of_birth: new Date('1812-02-07'),
                date_of_death: new Date('1870-06-09')
            }
        ];

        // Mock the find method to chain with sort
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        // Apply the mock directly to the Author model's `find` function
        Author.find = mockFind;

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Check if the result matches the expected sorted output
        const expectedAuthors = [
            ' : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910',
            'Tagore, Rabindranath : 1812 - 1870'
        ];
        expect(result).toEqual(expectedAuthors);

        // Verify that `.sort()` was called with the correct parameters
        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('should return an empty array when an error occurs', async () => {
        // Arrange: Mock the Author.find() method to throw an error
        Author.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        // Act: Call the function to get the authors list
        const result = await getAuthorList();

        // Assert: Verify the result is an empty array
        expect(result).toEqual([]);
    });

    it('should handle null date_of_birth and/or date_of_death correctly', async () => {
        const authorsWithMissingDates = [
            { first_name: 'Jane', family_name: 'Doe', date_of_birth: null, date_of_death: null },
            { first_name: 'John', family_name: 'Smith', date_of_birth: new Date('1900-05-01'), date_of_death: null },
            { first_name: 'Emily', family_name: 'Bronte', date_of_birth: null, date_of_death: new Date('1848-12-19') },
        ];
    
        Author.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(authorsWithMissingDates),
        });
    
        const result = await getAuthorList();
    
        const expectedAuthors = [
            'Doe, Jane :  - ',
            'Smith, John : 1900 - ',
            'Bronte, Emily :  - 1848',
        ];
        expect(result).toEqual(expectedAuthors);
    });
    

    it('should format fullname as empty string if family_name is absent', async () => {
        const authorsMissingFamilyName = [
            { first_name: 'Jane', family_name: '', date_of_birth: new Date('1775-12-16'), date_of_death: new Date('1817-07-18') },
        ];
    
        Author.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(authorsMissingFamilyName),
        });
    
        const result = await getAuthorList();
        expect(result).toEqual([' : 1775 - 1817']);
    });
    
    it('should return an empty array if no authors are found', async () => {
        Author.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
        const result = await getAuthorList();
        expect(result).toEqual([]);
    });

    it('should return authors sorted by family_name in ascending order', async () => {
        const unsortedAuthors = [
            { first_name: 'Amitav', family_name: 'Ghosh', date_of_birth: new Date('1835-11-30'), date_of_death: new Date('1910-04-21') },
            { first_name: 'Jane', family_name: 'Austen', date_of_birth: new Date('1775-12-16'), date_of_death: new Date('1817-07-18') },
        ];
    
        Author.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(unsortedAuthors),
        });
    
        const result = await getAuthorList();
        const expectedAuthors = [
            'Ghosh, Amitav : 1835 - 1910',
            'Austen, Jane : 1775 - 1817',
        ];
        expect(result).toEqual(expectedAuthors);
    });

    
    it('should handle authors with only one name', async () => {
        const singleNameAuthors = [
            { first_name: 'Anonymous', family_name: '', date_of_birth: new Date('1900-05-01') },
        ];
    
        Author.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(singleNameAuthors),
        });
    
        const result = await getAuthorList();
        expect(result).toEqual([' : 1900 - ']);
    });

    it('should handle authors with date_of_birth or date_of_death explicitly set to undefined', async () => {
        const authorsWithUndefinedDates = [
            { first_name: 'Samuel', family_name: 'Beckett', date_of_birth: undefined, date_of_death: new Date('1989-12-22') },
            { first_name: 'Virginia', family_name: 'Woolf', date_of_birth: new Date('1882-01-25'), date_of_death: undefined },
        ];
    
        Author.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(authorsWithUndefinedDates),
        });
    
        const result = await getAuthorList();
    
        const expectedAuthors = [
            'Beckett, Samuel :  - 1989',
            'Woolf, Virginia : 1882 - ',
        ];
        expect(result).toEqual(expectedAuthors);
    });

    it('should handle invalid date_of_birth or date_of_death types', async () => {
        const invalidAuthors = [
            { first_name: 'Invalid', family_name: 'Author', date_of_birth: 'invalid-date', date_of_death: new Date('1989-12-22') },
            { first_name: 'Valid', family_name: 'Author', date_of_birth: new Date('1900-05-01'), date_of_death: 'invalid-date' },
        ];
    
        Author.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(invalidAuthors),
        });
    
        const result = await getAuthorList();
    
        const expectedAuthors = [
            'Author, Invalid :  - 1989',
            'Author, Valid : 1900 - ',
        ];
    
        expect(result).toEqual(expectedAuthors);
    });
    
    
});

describe('showAllAuthors', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should send author list when data is available', async () => {
        const sortedAuthors = [
            {
                first_name: 'Jane',
                family_name: 'Austen',
                date_of_birth: new Date('1775-12-16'),
                date_of_death: new Date('1817-07-18')
            },
            {
                first_name: 'Amitav',
                family_name: 'Ghosh',
                date_of_birth: new Date('1835-11-30'),
                date_of_death: new Date('1910-04-21')
            }
        ];

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });

        Author.find = mockFind;

        const mockRes = {
            send: jest.fn()
        } as unknown as Response;

        await showAllAuthors(mockRes);

        const expectedAuthors = [
            'Austen, Jane : 1775 - 1817',
            'Ghosh, Amitav : 1835 - 1910'
        ];

        expect(mockRes.send).toHaveBeenCalledWith(expectedAuthors);
    });

    it('should send "No authors found" when no authors are available', async () => {
        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        Author.find = mockFind;

        const mockRes = {
            send: jest.fn()
        } as unknown as Response;

        await showAllAuthors(mockRes);

        expect(mockRes.send).toHaveBeenCalledWith('No authors found');
    });

    it('should handle errors and send "No authors found" when an error occurs', async () => {
        Author.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        const mockRes = {
            send: jest.fn()
        } as unknown as Response;

        await showAllAuthors(mockRes);

        expect(mockRes.send).toHaveBeenCalledWith('No authors found');
    });

    it('should handle malformed response objects', async () => {
        const mockRes = {
            send: jest.fn().mockImplementationOnce(() => {
                throw new Error('Response error');
            }),
        } as unknown as Response;
    
        await showAllAuthors(mockRes)
        
        expect(mockRes.send).toHaveBeenCalledWith('No authors found');
    });
});
