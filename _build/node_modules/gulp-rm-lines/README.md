# gulp-rm-lines
A gulp plugin that will delete all lines that matches one of the given regex filters.

## Notes
With respect to Carsten Schäfer's [work](https://www.npmjs.com/package/gulp-delete-lines) but now supports multiple filters.

With respect to Rolf Erik Lekang's [work](https://www.npmjs.com/package/gulp-remove-lines) but with minor bug fixes.

## Install

### `yarn`
```
yarn add --dev gulp-rm-lines
```

### `npm`

```
npm install --save-dev gulp-rm-lines
```


## Examples

Our index.html file:

```html
<!doctype html>
<html>
<head>
  <title>Our App</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="format-detection" content="telephone=no" />
  
  <link rel="stylesheet" href="vendor/normalize.css/normalize.css" />
  <link rel="stylesheet" href="vendor/font-awesome/css/font-awesome.min.css" />
  <link rel="stylesheet" href="assets/sass/desktop.css" />
  
</head>
<body ng-controller="AppController">
  <div>
      markup goes here...
  </div>
  
  <script src="vendor/jquery/jquery.min.js"></script>
  <script src="vendor/angular/angular.min.js"></script>
  <script src="app/app_Desktop.js"></script>
  
  <script>
    angular.bootstrap(document, ['ourApp']);
  </script>
</body>
</html>
```

### Example

Remove all external scripts and stylesheets from `index.html`

```js
const gulp = require('gulp'),
  rmLines = require('gulp-rm-lines');

gulp.task('remove-scripts', function () {
  gulp.src('./build/index.html')
   .pipe(rmLines({
      'filters': [
        /<script\s+src=['"]/i,
        /<link\s+rel=['"]stylesheet['"]/i,
      ]
    }))
  .pipe(gulp.dest('dist'));
});
```

## License

MIT © [Sam Grundman](https://github.com/YodasWs)
