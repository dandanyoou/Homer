from setuptools import setup, find_packages

setup(
    name='homer-cli',
    version='0.1.0',
    description='🍩 Homer - CLI 출력 토큰 압축기 (rtk 능가)',
    author='dandanyoou',
    author_email='gimdanyu94@gmail.com',
    url='https://github.com/dandanyoou/homer',
    py_modules=['homer'],
    entry_points={
        'console_scripts': [
            'homer=homer:main',
        ],
    },
    install_requires=['click>=8.0'],
    python_requires='>=3.8',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
    ],
)
