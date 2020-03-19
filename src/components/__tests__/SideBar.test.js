import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';


import SideBar from '../SideBar';

it("snapshots displays for demo user", () => {
    const { queryByTestId } = render(<SideBar />)

    expect(queryByTestId("snapshots")).toBeFalsy()
})