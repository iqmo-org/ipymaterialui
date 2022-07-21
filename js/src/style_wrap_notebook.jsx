// This is a specific 'fix' for the notebook only, since its fontsize is non-16
import React from 'react';
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const theme = createTheme({
    typography: {
        // Tell Material-UI what the font-size on the html element is.
        htmlFontSize: 10,
        useNextVariants: true,
    },
});

function FontSizeTheme({ children }) {
    return (
        <ThemeProvider theme={theme}>
            <Typography component="span">{children}</Typography>
        </ThemeProvider>
    );
}

FontSizeTheme.propTypes = {
    children: PropTypes.node.isRequired,
};

export
function styleWrapper(element) {
    return <FontSizeTheme>{element}</FontSizeTheme>;
}
