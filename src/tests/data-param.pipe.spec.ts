import { DataParamPipe } from '../app/shared/pipes/data-param.pipe';

describe('DataParamPipe', () => {
  it('create an instance', () => {
    const pipe = new DataParamPipe();
    expect(pipe).toBeTruthy();
  });
});
