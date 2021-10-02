## Code style plugin

The project uses [Google's code styleguide](https://google.github.io/styleguide/javaguide.html) for
Java files. Maven plugin [google-java-format](https://github.com/google/google-java-format) checks
for non-complying files during the build and suggests the following command to fix it.

```shell
$ mvn com.coveo:fmt-maven-plugin:format
```

## License plugin

Following are few useful commands
from [License Maven Plugin](https://www.mojohaus.org/license-maven-plugin/).

```shell
$ mvn license:update-project-license
$ mvn license:update-file-header
$ mvn license:add-third-party
```
