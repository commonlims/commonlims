import React from 'react';
import {resource} from 'app/redux/reducers/sharedList';
import {getUpdatedWorkBatch} from 'app/views/workBatchDetailsWaitingToBeMerged/workbatchDetails';
import {initCurrentFieldValues} from 'app/views/workBatchDetails/shared/workBatchFields';

describe('workbatch details', () => {
  it('should merge updated fields with original workbatch', () => {
    // Arrange
    const originalWorkbatch = {
      id: 1000,
      properties: {
        property1: {
          name: 'property1',
          value: 'orig value',
        },
        property2: {
          name: 'property2',
          value: 'orig value',
        },
      },
    };
    const initialState = {...resource.initialState};
    const workBatchDetailsEntry = {
      ...initialState,
      resource: originalWorkbatch,
    };
    const currentFieldValues = {
      property1: 'new value',
      property3: 'new value 3',
    };

    // Act
    const updatedWorkBatch = getUpdatedWorkBatch(
      workBatchDetailsEntry,
      currentFieldValues
    );

    // Assert
    const expectedMergedWorkbatch = {
      id: 1000,
      properties: {
        property1: {
          name: 'property1',
          value: 'new value',
        },
        property2: {
          name: 'property2',
          value: 'orig value',
        },
        property3: {
          name: 'property3',
          value: 'new value 3',
        },
      },
    };
    expect(updatedWorkBatch).toEqual(expectedMergedWorkbatch);
  });

  it('should convert blank values to null when merging fields', () => {
    // Arrange
    const originalWorkbatch = {
      id: 1000,
      properties: {
        property1: {
          name: 'property1',
          value: 'orig value',
        },
        property2: {
          name: 'property2',
          value: 'orig value',
        },
      },
    };
    const initialState = {...resource.initialState};
    const workBatchDetailsEntry = {
      ...initialState,
      resource: originalWorkbatch,
    };
    const currentFieldValues = {
      property1: 'new value',
      property3: '',
    };

    // Act
    const updatedWorkBatch = getUpdatedWorkBatch(
      workBatchDetailsEntry,
      currentFieldValues
    );

    // Assert
    const expectedMergedWorkbatch = {
      id: 1000,
      properties: {
        property1: {
          name: 'property1',
          value: 'new value',
        },
        property2: {
          name: 'property2',
          value: 'orig value',
        },
        property3: {
          name: 'property3',
          value: null,
        },
      },
    };
    expect(updatedWorkBatch).toEqual(expectedMergedWorkbatch);
  });
  it('init current values can handle non populated fields', () => {
    // Arrange
    const workDefinition = {
      fields: [{prop_name: 'fieldA'}, {prop_name: 'fieldB'}],
    };
    const workBatch = {
      properties: {},
    };
    // Act
    const currentFieldValues = initCurrentFieldValues(workBatch, workDefinition);

    // Assert
    const expected = {
      fieldA: null,
      fieldB: null,
    };
    expect(currentFieldValues).toEqual(expected);
  });

  it('init current values merge non-populated with populated fields', () => {
    // Arrange
    const workDefinition = {
      fields: [{prop_name: 'fieldA'}, {prop_name: 'fieldB'}],
    };
    const workBatch = {
      properties: {
        fieldB: {value: 'some value'},
      },
    };
    // Act
    const currentFieldValues = initCurrentFieldValues(workBatch, workDefinition);

    // Assert
    const expected = {
      fieldA: null,
      fieldB: 'some value',
    };
    expect(currentFieldValues).toEqual(expected);
  });
});
